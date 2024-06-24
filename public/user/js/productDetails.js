
let productQuantity = document.querySelector('.product-quantity')
const plus = document.querySelector('.plus')
const minus = document.querySelector('.minus')
const addToCartButton = document.querySelector('.add-to-cart')
const productStock = document.querySelector('.product-stock')
const cartCount = document.querySelector('.cart-count')

function showPopup(element, success, message) {
    element.style.display = 'flex'
    quantityModal.classList.add('message-animation')
    if (success) {
        quantityModalStatus.textContent = 'Success'
        quantityModalStatus.style.color = 'green'
        quantityModalMessage.textContent = message
    } else {
        quantityModalStatus.textContent = 'Failed'
        quantityModalStatus.style.color = 'red'
        quantityModalMessage.textContent = message
    }
    setTimeout(() => {
        element.style.display = 'none'
        // element.textContent = changingValue
    }, 1500);
    return
}
//error elements

const quantityModal = document.querySelector('.quantity-modal')
const quantityModalMessage = document.querySelector('.modal-message')
const quantityModalStatus = document.querySelector('.modal-status')


let count = productQuantity.value
console.log('value', count)
minus.addEventListener('click', decrementQuantity)
plus.addEventListener('click', incrementQuantity)

function incrementQuantity() {
    ++count;
    productQuantity.value = count;
}
function decrementQuantity() {
    if (count == 0) {
        return alert('0')
    }
    --count;
    productQuantity.value = count;
}

addToCartButton.addEventListener('click', async () => {
    minus.removeEventListener('click', decrementQuantity)
    plus.removeEventListener('click', incrementQuantity)
    let productQuantity = document.querySelector('.product-quantity').value
    if (productQuantity < 1) {
        showPopup(quantityModal, false, 'Quantity required.')
        minus.addEventListener('click', decrementQuantity)
        plus.addEventListener('click', incrementQuantity)
        return
    }
    const productId = addToCartButton.dataset.productid
    const response = await axios.post(`/user/addToCart/${productId}/${productQuantity}`)
    const data = response.data
    console.log(data)
    if (data.success) {
        productStock.innerHTML = `<span class="product-stock-in">
                                    <i class="ion-checkmark-circled red"></i>
                                    </span> ${data.productStock} IN STOCK`
        showPopup(quantityModal, data.success, data.message)
        console.log(data)
        if (data.cartLength) {
            cartCount.textContent = data.cartLength.toString()
        }

    } else if (!data.success) {
        showPopup(quantityModal, data.success, data.message)
    }
    minus.addEventListener('click', decrementQuantity)
    plus.addEventListener('click', incrementQuantity)
})

