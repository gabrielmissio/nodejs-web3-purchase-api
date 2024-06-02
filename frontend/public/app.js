/* eslint-disable no-undef */

let currentAccount = null
let userHasMetaMask = false
const API_URL = 'http://localhost:3000'
const currentUrl = new URL(window.location)

let productsCurrentPage = 1
let productsTotalPages = 1
const productsPerPage = 6

let ordersCurrentPage = 1
let ordersTotalPages = 1
const ordersPerPage = 3

const contractABI = [
  {
    'inputs': [],
    'stateMutability': 'payable',
    'type': 'constructor',
  },
  {
    'inputs': [],
    'name': 'InvalidState',
    'type': 'error',
  },
  {
    'inputs': [],
    'name': 'OnlyBuyer',
    'type': 'error',
  },
  {
    'inputs': [],
    'name': 'OnlySeller',
    'type': 'error',
  },
  {
    'inputs': [],
    'name': 'ValueNotEven',
    'type': 'error',
  },
  {
    'anonymous': false,
    'inputs': [],
    'name': 'Aborted',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [],
    'name': 'ItemReceived',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [],
    'name': 'PurchaseConfirmed',
    'type': 'event',
  },
  {
    'anonymous': false,
    'inputs': [],
    'name': 'SellerRefunded',
    'type': 'event',
  },
  {
    'inputs': [],
    'name': 'abort',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'buyer',
    'outputs': [
      {
        'internalType': 'address payable',
        'name': '',
        'type': 'address',
      },
    ],
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'confirmPurchase',
    'outputs': [],
    'stateMutability': 'payable',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'confirmReceived',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'refundSeller',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'seller',
    'outputs': [
      {
        'internalType': 'address payable',
        'name': '',
        'type': 'address',
      },
    ],
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'state',
    'outputs': [
      {
        'internalType': 'enum Purchase.State',
        'name': '',
        'type': 'uint8',
      },
    ],
    'stateMutability': 'view',
    'type': 'function',
  },
  {
    'inputs': [],
    'name': 'value',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256',
      },
    ],
    'stateMutability': 'view',
    'type': 'function',
  },
]

window.addEventListener('load', async function() {
  const { ordersPage, productsPage } = getSearchParams(window.location)
  userHasMetaMask = typeof window.ethereum !== 'undefined'

  loadProducts(productsPage)

  if (userHasMetaMask) {
    loadOrders(ordersPage)
    setupEvents()
  } else {
    const ordersElement = document.getElementById('orders')
    const orderElement = document.createElement('div')
    orderElement.innerHTML = `
      <p>Install MetaMask to see your orders</p>
    `
    ordersElement.appendChild(orderElement)
  }
})

function loadProducts (productsPage = 1) {
  const getProductsURL = new URL('products', API_URL)
  getProductsURL.searchParams.append('state', 'CREATED')
  getProductsURL.searchParams.append('limit', productsPerPage)
  getProductsURL.searchParams.append('page', productsPage)

  fetch(getProductsURL)
    .then(response => response.json().then(({ data: products, meta }) => {
      const web3 = new Web3(window.ethereum)
      const productsElement = document.getElementById('products')

      if (products.length === 0 && productsPage === 1) {
        const productElement = document.createElement('div')
        productElement.innerHTML = `
          <p>No products available</p>
        `
        productsElement.appendChild(productElement)

        document.getElementById('products-prev-btn').style.display = 'none'
        document.getElementById('products-next-btn').style.display = 'none'
      } else {
        document.getElementById('products-prev-btn').addEventListener('click', () => {
          if (productsCurrentPage > 1) {
            productsCurrentPage--
            currentUrl.searchParams.set('products_page', productsCurrentPage)
            currentUrl.search = currentUrl.searchParams.toString()
            window.location.href = currentUrl.toString()
          }
        })

        document.getElementById('products-next-btn').addEventListener('click', () => {
          if (productsCurrentPage < productsTotalPages) {
            productsCurrentPage++
            currentUrl.searchParams.set('products_page', productsCurrentPage)
            currentUrl.search = currentUrl.searchParams.toString()
            window.location.href = currentUrl.toString()
          }
        })
      }

      products.forEach(product => {
        const parsedPrice = web3.utils.fromWei(product.price, 'ether')

        const productElement = document.createElement('div')
        productElement.className = 'product'
        productElement.innerHTML = `
          <p>${product.name}</p>
          <p>Price: ${parsedPrice} ETH</p>
          <!-- <p>Address: ${product.contractAddress}</p> -->
          <button class="button" onclick="buyProduct('${product.contractAddress}', '${parsedPrice}')">Buy</button>
        `
        productsElement.appendChild(productElement)
      })

      productsTotalPages = Math.ceil(meta.total / productsPerPage)
      updatePaginationButtons(productsCurrentPage, productsTotalPages, 'products')

      window.buyProduct = async (contractAddress, price) => {
        try {
          if (!userHasMetaMask) {
            alert('Please install MetaMask to buy products')
            return
          }

          const contract1 = new web3.eth.Contract(contractABI, contractAddress)
          const account = await getCurrentAccount()

          // Call the smart contract
          await contract1.methods.confirmPurchase().send({
            from: account,
            value: web3.utils.toWei(price, 'ether'),
          })

          await sleep(3500)
          if (products.length === 1 && productsCurrentPage > 1) {
            productsCurrentPage--
            currentUrl.searchParams.set('products_page', productsCurrentPage)
            currentUrl.search = currentUrl.searchParams.toString()
          }
          window.location.href = currentUrl.toString()
        } catch (error) {
          console.error(error)
        }
      }

    }))
    .catch(error => console.error(error))
}

function loadOrders (ordersPage = 1) {
  ethereum.request({ method: 'eth_accounts' }).then(accounts => {
    if (accounts.length > 0) {
      currentAccount = accounts[0]

      const getOrdersURL = new URL('products', API_URL)
      getOrdersURL.searchParams.append('buyerAddress', currentAccount)
      getOrdersURL.searchParams.append('state', 'PURCHASE_CONFIRMED,ITEM_RECEIVED,SELLER_REFUNDED')
      getOrdersURL.searchParams.append('limit', ordersPerPage)
      getOrdersURL.searchParams.append('page', ordersPage)

      fetch(getOrdersURL)
        .then(response => response.json().then(({ data: products, meta }) => {
          const web3 = new Web3(window.ethereum)
          const productsElement = document.getElementById('orders')

          if (products.length === 0 && ordersPage === 1) {
            const productElement = document.createElement('div')
            productElement.innerHTML = `
            <p>No orders yet</p>
          `
            productsElement.appendChild(productElement)

            document.getElementById('orders-prev-btn').style.display = 'none'
            document.getElementById('orders-next-btn').style.display = 'none'
          } else {
            document.getElementById('orders-prev-btn').addEventListener('click', () => {
              if (ordersCurrentPage > 1) {
                ordersCurrentPage--
                currentUrl.searchParams.set('orders_page', ordersCurrentPage)
                currentUrl.search = currentUrl.searchParams.toString()
                window.location.href = currentUrl.toString()
              }
            })

            document.getElementById('orders-next-btn').addEventListener('click', () => {
              if (ordersCurrentPage < ordersTotalPages) {
                ordersCurrentPage++
                currentUrl.searchParams.set('orders_page', ordersCurrentPage)
                currentUrl.search = currentUrl.searchParams.toString()
                window.location.href = currentUrl.toString()
              }
            })
          }

          products.forEach(product => {
            const parsedPrice = web3.utils.fromWei(product.price, 'ether')

            const productElement = document.createElement('div')
            productElement.className = 'product'
            productElement.innerHTML = `
            <p>${product.name}</p>
            <p>Price: ${parsedPrice} ETH</p>
            <!-- <p>Address: ${product.contractAddress}</p> -->
            <!--${product.state === 'PURCHASE_CONFIRMED' ? '<p>Waiting for delivery</p>' : '<p>Waiting for confirmation</p>'} -->
            `

            if (product.state === 'PURCHASE_CONFIRMED') {
              productElement.innerHTML += `
              <p>Purchased On: ${formatDate(product.settledAt)}</p>
              <button class="button" onclick="confirmReceived('${product.contractAddress}')">Confirm Received</button>
            `
            } else if (product.state === 'ITEM_RECEIVED' || product.state === 'SELLER_REFUNDED') {
              productElement.innerHTML += `
              <p>Purchased On: ${formatDate(product.settledAt)}</p>
              <p>Received On: ${formatDate(product.receivedAt)}</p>
            `
            }

            productsElement.appendChild(productElement)
          })

          ordersTotalPages = Math.ceil(meta.total / ordersPerPage)
          updatePaginationButtons(ordersCurrentPage, ordersTotalPages, 'orders')

          this.window.confirmReceived = async (contractAddress) => {
            try {
              const contract1 = new web3.eth.Contract(contractABI, contractAddress)
              const account = await getCurrentAccount()

              // Call the smart contract
              await contract1.methods.confirmReceived().send({
                from: account,
              })

              await sleep(3500)
              this.window.location.reload()
            } catch (error) {
              console.error(error)
            }
          }

        }))
        .catch(error => console.error(error))
    } else {
      const ordersElement = document.getElementById('orders')

      const orderElement = document.createElement('div')
      orderElement.innerHTML = `
            <p>Connect your wallet to see your orders</p>
            <button class="button" onclick="connectWallet()">Connect Wallet</button>
          `
      ordersElement.appendChild(orderElement)
    }
  })
}

async function getCurrentAccount () {
  if (currentAccount) {
    return currentAccount
  }

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  if (accounts.length === 0) {
    alert('Unable to get accounts')
    return
  }
  currentAccount = accounts[0]

  return currentAccount
}

// eslint-disable-next-line no-unused-vars
function connectWallet () {
  if (!userHasMetaMask) {
    alert('Please install MetaMask to connect your wallet')
    return
  }

  ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
    if (accounts.length > 0) {
      window.location.reload()
    }
  })
}

function setupEvents () {
  window.ethereum
    .on('connect', () => console.log('connected'))

  window.ethereum
    .on('disconnect', () => console.log('disconnect'))

  window.ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log('eth_accounts', accounts)
    })

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      return
    }
    if (accounts[0] === currentAccount) {
      return
    }

    currentUrl.searchParams.set('products_page', 1)
    currentUrl.searchParams.set('orders_page', 1)
    currentUrl.search = currentUrl.searchParams.toString()
    window.location.href = currentUrl.toString()
  })
}

function getSearchParams () {
  const providedProductsPage = currentUrl.searchParams.get('products_page')
  const providedOrdersPage = currentUrl.searchParams.get('orders_page')

  const result = {
    productsPage: 1,
    ordersPage: 1,
  }

  if (providedProductsPage) {
    const parsedProvidedProductsPage = parseInt(providedProductsPage)
    if (!isNaN(parsedProvidedProductsPage) && parsedProvidedProductsPage > 0) {
      productsCurrentPage = parsedProvidedProductsPage
      result.productsPage = parsedProvidedProductsPage
    }
  }

  if (providedOrdersPage) {
    const parsedProvidedOrdersPage = parseInt(providedOrdersPage)
    if (!isNaN(parsedProvidedOrdersPage) && parsedProvidedOrdersPage > 0) {
      ordersCurrentPage = parsedProvidedOrdersPage
      result.ordersPage = parsedProvidedOrdersPage
    }
  }

  return result
}

function formatDate(date) {
  if (!date) {
    return '-'
  }

  return date
    .replace('T', ' ')
    .replace('Z', '')
    .slice(0, -7)
}

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/* Pagination functions */
function updatePaginationButtons(currentPage, totalPages, domain) {
  const pages = document.getElementById(`${domain}-pages`)

  pages.innerHTML = ''
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button')
    pageButton.textContent = i
    pageButton.addEventListener('click', function() {
      currentPage = i
      currentUrl.searchParams.set(`${domain}_page`, currentPage)
      currentUrl.search = currentUrl.searchParams.toString()
      window.location.href = currentUrl.toString()
    })
    if (i === currentPage) {
      pageButton.classList.add('active')
    }
    pages.appendChild(pageButton)
  }
}
