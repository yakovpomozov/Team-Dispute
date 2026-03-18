import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001
const GHL_BASE = 'https://rest.gohighlevel.com/v1'
const ANET_PROD = 'https://api.authorize.net/xml/v1/request.api'
const ANET_SANDBOX = 'https://apitest.authorize.net/xml/v1/request.api'

// Extract location_id from GHL JWT token
function getLocationId(apiKey) {
  try {
    const payload = JSON.parse(Buffer.from(apiKey.split('.')[1], 'base64').toString())
    return payload.location_id || null
  } catch {
    return null
  }
}

function resolveGhlKey(req) {
  return (req.headers['x-ghl-key'] || process.env.GHL_API_KEY || '').trim()
}

function resolveAnetCreds(req) {
  return {
    loginId: (req.body.loginId || process.env.AUTHORIZE_NET_API_LOGIN_ID || '').trim(),
    transKey: (req.body.transactionKey || process.env.AUTHORIZE_NET_TRANSACTION_KEY || '').trim(),
    env: req.body.env || process.env.AUTHORIZE_NET_ENV || 'production',
  }
}

async function ghlGet(path, params, apiKey) {
  const { data } = await axios.get(`${GHL_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
    },
    params,
  })
  return data
}

// ─── GHL: Test connection ────────────────────────────────────────────────────
app.get('/api/ghl/test', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    if (!apiKey) return res.status(400).json({ error: 'No API key provided' })
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid API key — cannot decode location ID' })
    await ghlGet('/pipelines/', { locationId }, apiKey)
    res.json({ success: true, locationId })
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── GHL: Pipelines with opportunity counts ───────────────────────────────────
app.get('/api/ghl/pipelines', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid GHL API key' })

    // Get all pipelines
    const pipelineData = await ghlGet('/pipelines/', { locationId }, apiKey)
    const pipelines = pipelineData.pipelines || []

    // Get all opportunities to count per stage
    let allOpps = []
    let page = 1
    let hasMore = true
    while (hasMore) {
      const oppData = await ghlGet('/opportunities/search', {
        location_id: locationId,
        limit: 100,
        page,
      }, apiKey)
      const batch = oppData.opportunities || []
      allOpps = allOpps.concat(batch)
      if (batch.length < 100) hasMore = false
      else page++
    }

    // Count opportunities by stage
    const stageCounts = {}
    for (const opp of allOpps) {
      const key = `${opp.pipelineId}:${opp.pipelineStageId}`
      stageCounts[key] = (stageCounts[key] || 0) + 1
    }

    // Annotate pipelines with counts
    const result = pipelines.map(pipeline => ({
      ...pipeline,
      stages: (pipeline.stages || []).map(stage => ({
        ...stage,
        contactCount: stageCounts[`${pipeline.id}:${stage.id}`] || 0,
      })),
    }))

    res.json({ pipelines: result })
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── GHL: Appointments ───────────────────────────────────────────────────────
app.get('/api/ghl/appointments', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid GHL API key' })

    const { startDate, endDate, userId } = req.query
    const params = { locationId }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (userId) params.userId = userId

    const data = await ghlGet('/appointments/', params, apiKey)
    res.json(data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── GHL: Conversations (calls + texts) ──────────────────────────────────────
app.get('/api/ghl/conversations', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid GHL API key' })

    const { assignedTo, startAfterDate, limit = 100, page = 1 } = req.query
    const params = { locationId, limit, page }
    if (assignedTo) params.assignedTo = assignedTo
    if (startAfterDate) params.startAfterDate = startAfterDate

    const data = await ghlGet('/conversations/search', params, apiKey)
    res.json(data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── GHL: Opportunities / Closes ─────────────────────────────────────────────
app.get('/api/ghl/opportunities', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid GHL API key' })

    const { assignedTo, status, startAfter, endBefore, limit = 100, page = 1 } = req.query
    const params = { location_id: locationId, limit, page }
    if (assignedTo) params.assignedTo = assignedTo
    if (status) params.status = status
    if (startAfter) params.startAfter = startAfter
    if (endBefore) params.endBefore = endBefore

    const data = await ghlGet('/opportunities/search', params, apiKey)
    res.json(data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── GHL: Dashboard summary ──────────────────────────────────────────────────
// Single endpoint that returns all dashboard metrics for GHL
app.get('/api/ghl/dashboard', async (req, res) => {
  try {
    const apiKey = resolveGhlKey(req)
    const locationId = getLocationId(apiKey)
    if (!locationId) return res.status(400).json({ error: 'Invalid GHL API key' })

    const { kenUserId, yashaUserId } = req.query

    // Today's date range — UTC-safe to avoid midnight boundary issues
    const now = new Date()
    const todayUTC = now.toISOString().split('T')[0]
    const todayStart = `${todayUTC}T00:00:00.000Z`
    const todayEnd = `${todayUTC}T23:59:59.999Z`
    const todayTs = new Date(`${todayUTC}T00:00:00.000Z`).getTime()

    // Fetch in parallel: appointments, conversations, closes
    const apptParams = { locationId, startDate: todayStart, endDate: todayEnd }
    if (kenUserId) apptParams.userId = kenUserId

    const convoParams = { locationId, startAfterDate: todayTs, limit: 500 }
    if (kenUserId) convoParams.assignedTo = kenUserId

    const closeParams = { location_id: locationId, status: 'won', startAfter: todayTs, limit: 100 }
    if (yashaUserId) closeParams.assignedTo = yashaUserId

    const [apptData, convoData, closeData] = await Promise.allSettled([
      ghlGet('/appointments/', apptParams, apiKey),
      ghlGet('/conversations/search', convoParams, apiKey),
      ghlGet('/opportunities/search', closeParams, apiKey),
    ])

    // Count appointments
    const appointments = apptData.status === 'fulfilled'
      ? (apptData.value.appointments || []).length
      : null

    // Count calls and texts from conversations
    let calls = null
    let texts = null
    if (convoData.status === 'fulfilled') {
      const convos = convoData.value.conversations || []
      calls = convos.filter(c =>
        c.lastMessageType === 'TYPE_CALL' ||
        c.type === 'TYPE_CALL' ||
        (c.lastMessageBody || '').toLowerCase().includes('call')
      ).length
      texts = convos.filter(c =>
        c.lastMessageType === 'TYPE_SMS' ||
        c.type === 'TYPE_SMS' ||
        c.lastMessageType === 'SMS'
      ).length
      // If we can't distinguish, return total count as well
      if (calls === 0 && texts === 0) {
        calls = null
        texts = null
      }
    }

    // Count closes
    const closes = closeData.status === 'fulfilled'
      ? (closeData.value.opportunities || []).length
      : null

    res.json({
      appointments,
      calls,
      texts,
      closes,
      errors: {
        appointments: apptData.status === 'rejected' ? apptData.reason?.message : null,
        conversations: convoData.status === 'rejected' ? convoData.reason?.message : null,
        closes: closeData.status === 'rejected' ? closeData.reason?.message : null,
      },
    })
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || err.message })
  }
})

// ─── Authorize.net: Test connection ──────────────────────────────────────────
app.post('/api/anet/test', async (req, res) => {
  try {
    const { loginId, transKey, env } = resolveAnetCreds(req)
    if (!loginId || !transKey) return res.status(400).json({ error: 'Missing API credentials' })

    const url = env === 'sandbox' ? ANET_SANDBOX : ANET_PROD
    const { data } = await axios.post(url, {
      authenticateTestRequest: {
        merchantAuthentication: { name: loginId, transactionKey: transKey },
      },
    })

    if (data?.messages?.resultCode === 'Ok') {
      res.json({ success: true, env })
    } else {
      const msg = data?.messages?.message?.[0]?.text || 'Authentication failed'
      res.status(400).json({ error: msg })
    }
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message })
  }
})

// ─── Authorize.net: Get transactions ─────────────────────────────────────────
// Returns settled + unsettled transactions for the current month
app.post('/api/anet/transactions', async (req, res) => {
  try {
    const { loginId, transKey, env } = resolveAnetCreds(req)
    if (!loginId || !transKey) return res.status(400).json({ error: 'Missing API credentials' })

    const url = env === 'sandbox' ? ANET_SANDBOX : ANET_PROD
    const auth = { name: loginId, transactionKey: transKey }

    // Get current month range — UTC-safe so month boundary never slips into previous month
    const now = new Date()
    const y = now.getUTCFullYear()
    const m = String(now.getUTCMonth() + 1).padStart(2, '0')
    const firstOfMonth = `${y}-${m}-01T00:00:00Z`
    const today = `${now.toISOString().split('T')[0]}T23:59:59Z`

    // Get settled batches for the month
    const batchRes = await axios.post(url, {
      getSettledBatchListRequest: {
        merchantAuthentication: auth,
        includeStatistics: true,
        firstSettlementDate: firstOfMonth,
        lastSettlementDate: today,
      },
    })

    const batches = batchRes.data?.batchList?.batch || []
    const batchArr = Array.isArray(batches) ? batches : [batches]

    // Fetch transactions for each batch
    let settledTransactions = []
    const batchFetches = batchArr.map(batch =>
      axios.post(url, {
        getTransactionListRequest: {
          merchantAuthentication: auth,
          batchId: batch.batchId,
          sorting: { orderBy: 'submitTimeUTC', orderDescending: true },
          paging: { limit: 1000, offset: 1 },
        },
      }).then(r => {
        const txList = r.data?.transactions?.transaction || []
        return Array.isArray(txList) ? txList : [txList]
      }).catch(() => [])
    )
    const batchResults = await Promise.all(batchFetches)
    settledTransactions = batchResults.flat()

    // Also get unsettled transactions
    let unsettledTransactions = []
    try {
      const unsettledRes = await axios.post(url, {
        getUnsettledTransactionListRequest: {
          merchantAuthentication: auth,
          sorting: { orderBy: 'submitTimeUTC', orderDescending: true },
          paging: { limit: 1000, offset: 1 },
        },
      })
      const txList = unsettledRes.data?.transactions?.transaction || []
      unsettledTransactions = Array.isArray(txList) ? txList : [txList]
    } catch {
      // unsettled is optional
    }

    // Normalize transactions
    const normalize = (tx, settled) => ({
      id: tx.transId,
      submitTime: tx.submitTimeUTC || tx.submitTimeLocal,
      settleTime: tx.settleTimeUTC || tx.settleTimeLocal || null,
      status: tx.transactionStatus || (settled ? 'settledSuccessfully' : 'capturedPendingSettlement'),
      amount: parseFloat(tx.settleAmount || tx.authAmount || 0),
      firstName: tx.firstName || tx.customer?.email?.split('@')[0] || '',
      lastName: tx.lastName || '',
      email: tx.customer?.email || '',
      cardType: tx.payment?.creditCard?.cardType || '',
      last4: tx.payment?.creditCard?.cardNumber?.slice(-4) || '',
      settled,
    })

    const all = [
      ...settledTransactions.map(tx => normalize(tx, true)),
      ...unsettledTransactions.map(tx => normalize(tx, false)),
    ]

    // Sort by submitTime descending
    all.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime))

    // Calculate totals
    const monthTotal = all
      .filter(tx => tx.status !== 'voided' && tx.status !== 'refundSettledSuccessfully')
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Group by day for dashboard
    const byDay = {}
    const byWeek = {}
    for (const tx of all) {
      if (!tx.submitTime) continue
      const d = new Date(tx.submitTime)
      if (isNaN(d.getTime())) continue
      const dayKey = d.toISOString().split('T')[0]
      const todayKey = new Date().toISOString().split('T')[0]
      const weekStart = new Date(now)
      weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay())
      weekStart.setUTCHours(0, 0, 0, 0)

      if (dayKey === todayKey) {
        byDay[dayKey] = (byDay[dayKey] || 0) + tx.amount
      }
      if (d >= weekStart) {
        byWeek['week'] = (byWeek['week'] || 0) + tx.amount
      }
    }

    res.json({
      transactions: all,
      monthTotal: parseFloat(monthTotal.toFixed(2)),
      todayTotal: parseFloat((byDay[new Date().toISOString().split('T')[0]] || 0).toFixed(2)),
      weekTotal: parseFloat((byWeek['week'] || 0).toFixed(2)),
    })
  } catch (err) {
    console.error('Authorize.net error:', err.response?.data || err.message)
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Team Dispute API server running on http://localhost:${PORT}`)
})
