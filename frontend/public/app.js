/* eslint-disable no-undef */
window.addEventListener('load', function() {
  if (typeof window.ethereum !== 'undefined') {
    fetch('http://localhost:3000/products')
      .then(response => response.json().then(({ data: products }) => {
        const web3 = new Web3(window.ethereum)
        const productsElement = document.getElementById('products')

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

        if (products.length === 0) {
          const productElement = document.createElement('div')
          productElement.innerHTML = `
            <p>No products available</p>
          `
          productsElement.appendChild(productElement)
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
            <button class="button" onclick="confirmReceived('${product.contractAddress}')">Confirm Receive</button>
          `
          productsElement.appendChild(productElement)
        })

        window.buyProduct = async (contractAddress, price) => {
          try {
            console.log({ contractAddress, contractABI })

            const contract1 = new web3.eth.Contract(contractABI, contractAddress)
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0]

            // Call the smart contract
            await contract1.methods.confirmPurchase().send({
              from: account,
              value: web3.utils.toWei(price, 'ether'),
            })
          } catch (error) {
            console.error(error)
          }
        }
        this.window.confirmReceived = async (contractAddress) => {
          try {
            console.log({ contractAddress, contractABI })
            const contract1 = new web3.eth.Contract(contractABI, contractAddress)

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0]

            // Call the smart contract
            await contract1.methods.confirmReceived().send({
              from: account,
            })
          } catch (error) {
            console.error(error)
          }
        }

      }))
      .catch(error => console.error(error))
  } else {
    console.log('MetaMask is not installed!')
  }
})
