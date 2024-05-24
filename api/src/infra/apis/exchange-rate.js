async function getExchangeRate(crypto, fiat) {
  const requestURL = new URL('api/v3/simple/price', process.env.EXCHANGE_RATE_API)
  requestURL.searchParams.append('vs_currencies', fiat)
  requestURL.searchParams.append('ids', crypto)

  const response = await fetch(requestURL)

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate')
  }

  const parsedResponse = await response.json()
  const value = parsedResponse[crypto][fiat] // TODO: Validate response before accessing properties

  return { value }
}

module.exports = { getExchangeRate }
