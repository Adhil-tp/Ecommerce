
const quantityController = document.querySelectorAll('.quantity-controller')
const removeFormCartButtons = document.querySelectorAll('.remove-from-cart')



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
    const productQuantity = event.target.value
    const response = await axios.post(`/user/addToCart/${productId}/${productQuantity}`)
    const data = response.data
    if (data.success) {
        document.querySelector(`.product-quantity-${productId}`).textContent = data.cartProductsTotalCount
        event.target.value = 0
        document.querySelector(`.product-total-${productId}`).innerHTML = data.productTotal
        document.querySelector('.cart_amount').textContent = data.totalCartPrice
        showPopup(quantityModal, data.success, data.message)
    } else {
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
        // const response = await axios.delete(`/use/deleteCartProduct/`)
    })
})