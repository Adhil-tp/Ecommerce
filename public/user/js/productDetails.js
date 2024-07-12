
let productQuantity = document.querySelector('.product-quantity')
const plus = document.querySelector('.plus')
const minus = document.querySelector('.minus')
const addToCartButton = document.querySelector('.add-to-cart')
const addToWishlistButtons = document.querySelectorAll('.wishlist')
const wishlistCount = document.querySelector('.wishlist-count')
const wishlistIcon = document.querySelector('.wishlist-icon')
const wishlistAction = document.querySelector('.wishlist-action')
const productStock = document.querySelector('.product-stock')
const cartCount = document.querySelector('.cart-count')
const buyNow = document.querySelector('.buy-now')


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
async function wishListOperation(event) {
    console.log(event.target.dataset)

    const productId = document.querySelector('.wishlist-product-id').dataset.productid
    console.log(productId)

    try {
        const response = await axios.post(`/user/addToWishlist?productId=${productId}`)
        const data = response.data
        if (data.success) {
            console.log(wishlistAction)
            if (data.isInWishlist) {
                wishlistIcon.classList.remove('icon-heart')
                wishlistIcon.classList.add('fa', 'fa-heart')
                wishlistAction.textContent = 'Remove from wishlist'
            } else {
                wishlistIcon.classList.remove('fa', 'fa-heart')
                wishlistIcon.classList.add('icon-heart')
                wishlistAction.textContent = 'Add to wishlist'
            }
            wishlistCount.textContent = data.wishListLength
        }if(!data.success && !data.isLoggedIn){
            window.location.href ='/login'
        }
    } catch (err) {
        console.log(err)
    }
}
addToCartButton.addEventListener('click', async () => {
    minus.removeEventListener('click', decrementQuantity)
    plus.removeEventListener('click', incrementQuantity)
    let productQuantity = document.querySelector('.product-quantity').value
    console.log(productQuantity)
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

    }else if(!data.success && !data.isLoggedIn) {
        window.location.href = '/login'
    }
    else if (!data.success) {
        showPopup(quantityModal, data.success, data.message)
    }
    minus.addEventListener('click', decrementQuantity)
    plus.addEventListener('click', incrementQuantity)
})

buyNow.addEventListener('click', (event) => {
    let productQuantity = document.querySelector('.product-quantity').value
    const productId = event.target.dataset.productid
    console.log(productQuantity , productId)
    if(productQuantity > 0){
        window.location.href =`/user/checkout?productId=${productId}&quantity=${productQuantity}`
    }else if (productQuantity == 0){
        window.location.href =`/user/checkout?productId=${productId}&quantity=${1}`
    }
    
})

// href="/user/checkout?price=<%=product.offerPrice ? product.offerPrice : product.price %>&productId=<%= product._id %>"
addToWishlistButtons.forEach(button => {
    button.addEventListener('click', wishListOperation)
})


const log = console.log.bind(console)
