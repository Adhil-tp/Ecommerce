

const paginationButtons = document.querySelectorAll('.pagination-button')
let productsContainer = document.querySelector('.products')
const product = document.querySelectorAll('.product')

const quantityModal = document.querySelector('.quantity-modal')
const quantityModalMessage = document.querySelector('.modal-message')
const quantityModalStatus = document.querySelector('.modal-status')

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

const filterPrice = document.querySelectorAll('.filter-by-price')
const categoryFilter = document.querySelectorAll('.category-select')

let chosenCategoryId
let chosenPrice

paginationButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        const paginationValue = event.target.dataset.value
        console.log('first', paginationValue)
        const response = await axios.get(`/user/api/getProductsByPagination/${paginationValue}/${chosenCategoryId}`)
        const data = response.data
        // console.log(data)
        console.log('no erro')
        showProductsFunction(data)
        window.scroll({
            top: 0,
            behavior: "smooth"
        })
    })
})

categoryFilter.forEach(button => {
    button.addEventListener('click', async (event) => {
        console.log(event.target.value)
        const categoryId = event.target.value
        chosenCategoryId = categoryId
        const response = await axios.get(`/user/api/getProductByCategory/${categoryId}`)
        const data = response.data
        console.log(data)
        showProductsFunction(data)
    })
})

filterPrice.forEach(button => {
    button.addEventListener('click', async (event) => {
        console.log(event.target.dataset.price)
        const priceRange = event.target?.dataset?.price
        try {
            const response = await axios.get(`/user/api/filterByPrice/${chosenCategoryId ? chosenCategoryId : undefined}/${priceRange}`)
            const data = response.data
            console.log('response' , data )
            showProductsFunction(data)
        }catch(error){
            console.log(error.response)
            if(error.response.status == 404){
                showPopup(quantityModal , error?.response?.data?.success , error?.response?.data?.message)
            }
        }
        // console.log(data)

    })
})

function showProductsFunction(data) {
    // if (!data.success) {
    //     productsContainer.innerHTML = ''
    //     const emptyShow = document.createElement('h1')
    //     emptyShow.classList.add('empty-found')
    //     console.log(emptyShow)
    //     emptyShow.textContent = 'No products found'
    //     productsContainer.appendChild(emptyShow)
    //     return
    // }
    productsContainer.innerHTML = ''
    data.sortedProducts.forEach(product => {
        const newProduct = `
        <div class="product col-xl-3 col-lg-4 col-sm-6 col-12">
        <div class="product-default-single-item product-color--golden"
            data-aos="fade-up" data-aos-delay="0">
            <div class="image-box">
                <a href="/user/productDetails/${product._id}"
                    class="image-link">
                    <img src="/images/products/${product.mainImage}" alt="">
                    <img src="/images/products/${product.detailedImages[0]}" alt="">
                </a>
                <div class="action-link">
                    <div class="action-link-left">
                        <a href="#" data-bs-toggle="modal"
                            data-bs-target="#modalAddcart">Add to
                            Cart</a>
                    </div>
                    <div class="action-link-right">
                        <a href="#" data-bs-toggle="modal"
                            data-bs-target="#modalQuickview"><i
                                class="icon-magnifier"></i></a>
                        <a href="/api/user/addToCart"><i class="icon-heart"></i></a>
                        <a href="compare.html"><i class="icon-shuffle"></i></a>
                    </div>
                </div>
            </div>
            <div class="content">
                <div class="content-left">
                    <h6 class="title"><a
                            href="/user/productDetails/${product._id}">${product.name}</a></h6>
                    <ul class="review-star">
                        <li class="fill"><i
                                class="ion-android-star"></i>
                        </li>
                        <li class="fill"><i
                                class="ion-android-star"></i>
                        </li>
                        <li class="fill"><i
                                class="ion-android-star"></i>
                        </li>
                        <li class="fill"><i
                                class="ion-android-star"></i>
                        </li>
                        <li class="empty"><i
                                class="ion-android-star"></i>
                        </li>
                    </ul>
                </div>
                <div class="content-right">
                ${product.offerPrice
                ? `<span class="price"><del class="red">₹${product.price}</del></span>
                       <span class="price">₹${product.offerPrice}</span>`
                : `<span class="price">₹${product.price}</span>`
            }
                </div>

            </div>
        </div>
    </div>
        `
        productsContainer.innerHTML += newProduct
    })
}
