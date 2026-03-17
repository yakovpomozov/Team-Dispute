/**
 * GoHighLevel (GHL) API integration
 *
 * TODO: Replace these stub functions with real GHL REST API calls.
 * Docs: https://highlevel.stoplight.io/docs/integrations/
 *
 * All functions accept a `settings` object containing:
 *   - ghlApiKey      (from Settings page)
 *   - ghlBaseUrl     (default: https://rest.gohighlevel.com/v1)
 *   - ghlEnabled     (feature flag)
 */

const headers = (apiKey) => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  Version: '2021-07-28',
})

/**
 * Fetch today's contacts/leads from GHL pipeline.
 * Maps to: leadsContacted
 *
 * GHL Endpoint: GET /contacts/?startAfter={timestamp}&limit=100
 */
export async function fetchDailyLeads(settings, dateStr) {
  if (!settings.ghlEnabled || !settings.ghlApiKey) {
    return { count: null, source: 'manual' }
  }

  // TODO: Replace with real implementation
  // const startTs = new Date(dateStr).getTime()
  // const res = await fetch(
  //   `${settings.ghlBaseUrl}/contacts/?startAfter=${startTs}&limit=100`,
  //   { headers: headers(settings.ghlApiKey) }
  // )
  // const data = await res.json()
  // return { count: data.meta?.total ?? data.contacts?.length ?? 0, source: 'ghl' }

  console.warn('[GHL] fetchDailyLeads: API not yet connected. Returning null.')
  return { count: null, source: 'manual' }
}

/**
 * Fetch today's appointments from GHL calendar.
 * Maps to: appointmentsSet
 *
 * GHL Endpoint: GET /appointments/?startDate={date}&endDate={date}
 */
export async function fetchDailyAppointments(settings, dateStr) {
  if (!settings.ghlEnabled || !settings.ghlApiKey) {
    return { count: null, source: 'manual' }
  }

  // TODO: Replace with real implementation
  // const res = await fetch(
  //   `${settings.ghlBaseUrl}/appointments/?startDate=${dateStr}&endDate=${dateStr}`,
  //   { headers: headers(settings.ghlApiKey) }
  // )
  // const data = await res.json()
  // return { count: data.appointments?.length ?? 0, source: 'ghl' }

  console.warn('[GHL] fetchDailyAppointments: API not yet connected. Returning null.')
  return { count: null, source: 'manual' }
}

/**
 * Fetch pipeline opportunities (closes) for a date.
 * Maps to: closes
 *
 * GHL Endpoint: GET /opportunities/search?status=won&startAfter={ts}
 */
export async function fetchDailyCloses(settings, dateStr) {
  if (!settings.ghlEnabled || !settings.ghlApiKey) {
    return { count: null, source: 'manual' }
  }

  // TODO: Replace with real implementation
  // const startTs = new Date(dateStr).getTime()
  // const res = await fetch(
  //   `${settings.ghlBaseUrl}/opportunities/search?status=won&startAfter=${startTs}`,
  //   { headers: headers(settings.ghlApiKey) }
  // )
  // const data = await res.json()
  // return { count: data.opportunities?.length ?? 0, source: 'ghl' }

  console.warn('[GHL] fetchDailyCloses: API not yet connected. Returning null.')
  return { count: null, source: 'manual' }
}

/**
 * Sync all available GHL data for a given date.
 * Returns a partial KPI entry object with only the fields populated by GHL.
 */
export async function syncGHLForDate(settings, dateStr) {
  const [leads, appts, closes] = await Promise.all([
    fetchDailyLeads(settings, dateStr),
    fetchDailyAppointments(settings, dateStr),
    fetchDailyCloses(settings, dateStr),
  ])

  const patch = {}
  if (leads.count !== null)  patch.leadsContacted  = leads.count
  if (appts.count !== null)  patch.appointmentsSet = appts.count
  if (closes.count !== null) patch.closes          = closes.count

  return { patch, sources: { leads: leads.source, appts: appts.source, closes: closes.source } }
}
