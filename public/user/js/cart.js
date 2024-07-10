
const quantityController = document.querySelectorAll('.quantity-controller')
const removeFormCartButtons = document.querySelectorAll('.remove-from-cart')
const cartAmount = document.querySelector('.cart_amount')


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

const quantityModal = document.querySelector('.quantity-modal')
const quantityModalMessage = document.querySelector('.modal-message')
const quantityModalStatus = document.querySelector('.modal-status')



async function quantityControllerFunction(event) {
    const productId = event.target.dataset.productid
    const productQuantity = parseInt(event.target.value)
    const currentQuantity = parseInt(document.querySelector(`.product-quantity-${productId}`).textContent.trim())
    event.target.disabled = true
    const response = await axios.post(`/user/addToCart/${productId}/${productQuantity}`)
    const data = response.data
    setTimeout(function (){
        event.target.disabled = false
    }, 1000)
    if (data.success) {
        document.querySelector(`.product-quantity-${productId}`).textContent = `${data.cartProductsTotalCount}`
        event.target.value = 0
        document.querySelector(`.product-total-${productId}`).innerHTML = `₹${data.productTotal}`
        const cartAmount = document.querySelectorAll('.cart_amount')
        cartAmount.forEach(amount => amount.textContent = `₹${data.totalCartPrice}`)
        showPopup(quantityModal, data.success, data.message)
        console.log(data.totalCartPrice)
        if(data.totalCartPrice < 500 && data.totalCartPrice > 0){
            document.querySelector('.payable').textContent = data.totalCartPrice + 49
        }else{
            document.querySelector('.payable').textContent = `₹${data.totalCartPrice}`
        }
        if(data.discountPrice){
            document.querySelector('.payable')
        }
    } else {
        event.target.value = 0
        showPopup(quantityModal, data.success, data.message)
    }
}

function debounce(debounceFunction, wait) {
    let timer
    return (event) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            debounceFunction(event)
        }, wait);
    }
}
quantityController.forEach(controller => {
    controller.addEventListener('change', debounce(quantityControllerFunction, 400))
})


removeFormCartButtons.forEach(removeButton => {
    removeButton.addEventListener('click', async (event) => {
        const productId = event.target.dataset.productid
        console.log('clicked delete button', productId)
        const response = await axios.delete(`/user/deleteCartProduct/${productId}`)
        const data = response.data
        console.log(data)
        if (data.success) {
            const removingRow = event.target.parentNode.parentNode.parentNode
            cartAmount.innerHTML = `<p class="cart_amount">₹${data.total}</p>`
            document.querySelector('.payable').textContent = `₹${data.total}`
            console.log(removingRow)
            removingRow.parentNode.removeChild(removingRow)
        }
        // console.log(event)
    })
})