const dumbCache = new Map()
const cacheTimeToLive = 2 * 60 * 1000 // (2 minutes in milliseconds)

async function getExchangeRate(crypto, fiat) {
  const cachedValue = dumbCache.get(`${crypto}-${fiat}`)
  const now = Date.now()

  // Check if the cached rate is expired
  if (!cachedValue || now >= cachedValue.expires) {
    console.log('Exchange rate cache miss...')
    // Fetch new rate and update the cache
    dumbCache.set(`${crypto}-${fiat}`, {
      value: await fetchExchangeRate(crypto, fiat),
      expires: now + cacheTimeToLive,
    })
  } else {
    console.log('Exchange rate cache hit!')
  }

  return dumbCache.get(`${crypto}-${fiat}`)
}

async function fetchExchangeRate(crypto, fiat) {
  const requestURL = new URL('api/v3/simple/price', process.env.EXCHANGE_RATE_API)
  requestURL.searchParams.append('vs_currencies', fiat)
  requestURL.searchParams.append('ids', crypto)

  const response = await fetch(requestURL)

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate')
  }

  const parsedResponse = await response.json()
  const value = parsedResponse[crypto][fiat] // TODO: Validate response before accessing properties

  return value
}

module.exports = { getExchangeRate }
