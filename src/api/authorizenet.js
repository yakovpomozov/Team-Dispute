/**
 * Authorize.net API integration
 *
 * TODO: Replace stub functions with real Authorize.net API calls.
 * Docs: https://developer.authorize.net/api/reference/
 *
 * IMPORTANT: Never expose your API keys on the client side in production.
 * These calls should be proxied through a secure backend server.
 * The settings here are stored in localStorage for prototype purposes only.
 *
 * Settings used:
 *   - authorizeNetApiLoginId
 *   - authorizeNetTransactionKey
 *   - authorizeNetSandbox   (true = sandbox, false = production)
 *   - authorizeNetEnabled
 */

const getEndpoint = (sandbox) =>
  sandbox
    ? 'https://apitest.authorize.net/xml/v1/request.api'
    : 'https://api.authorize.net/xml/v1/request.api'

/**
 * Fetch settled transactions for a given date range.
 * Maps total to: revenueCollected
 *
 * Authorize.net API: getSettledBatchListRequest → getTransactionListRequest
 */
export async function fetchDailyRevenue(settings, dateStr) {
  if (!settings.authorizeNetEnabled ||
      !settings.authorizeNetApiLoginId ||
      !settings.authorizeNetTransactionKey) {
    return { amount: null, transactionCount: null, source: 'manual' }
  }

  // TODO: Replace with real implementation
  //
  // Step 1 – get settled batch list for the date
  // const batchBody = {
  //   getSettledBatchListRequest: {
  //     merchantAuthentication: {
  //       name: settings.authorizeNetApiLoginId,
  //       transactionKey: settings.authorizeNetTransactionKey,
  //     },
  //     includeStatistics: true,
  //     firstSettlementDate: `${dateStr}T00:00:00Z`,
  //     lastSettlementDate:  `${dateStr}T23:59:59Z`,
  //   }
  // }
  // const batchRes  = await fetch(getEndpoint(settings.authorizeNetSandbox), {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(batchBody),
  // })
  // const batchData = await batchRes.json()
  //
  // Step 2 – sum up settlement amounts across all batches
  // const batches = batchData?.getSettledBatchListResponse?.batchList?.batch ?? []
  // const amount  = batches.reduce((sum, b) => sum + Number(b.statistics?.[0]?.chargeAmount ?? 0), 0)
  // return { amount, transactionCount: batches.length, source: 'authorizenet' }

  console.warn('[Authorize.net] fetchDailyRevenue: API not yet connected. Returning null.')
  return { amount: null, transactionCount: null, source: 'manual' }
}

/**
 * Sync Authorize.net revenue for a date.
 * Returns a partial KPI entry patch.
 */
export async function syncAuthorizeNetForDate(settings, dateStr) {
  const result = await fetchDailyRevenue(settings, dateStr)
  if (result.amount === null) return { patch: {}, source: 'manual' }
  return {
    patch: {
      revenueCollected: result.amount,
      revenueFromApi: true,
    },
    source: 'authorizenet',
    transactionCount: result.transactionCount,
  }
}
