const paginationButtons = document.querySelectorAll('.pagination-button')
let productsContainer = document.querySelector('.products')
const product = document.querySelectorAll('.product')

let chosenCategoryId

paginationButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        const paginationValue = event.target.dataset.value
        const response = await axios.get(`/user/api/getProductsByPagination/${paginationValue}/${chosenCategoryId}`)
            const data = response.data
            if (!data.error) {
                showProductsFunction(data)
                window.scroll({
                    top : 0 , 
                    behavior : "smooth"
                })
            }
    })
})

function showProductsFunction(data){
    productsContainer.innerHTML = ''
    data.sortedProducts.forEach(product => {
        const newProduct = `
        <div class="col-xl-3 col-lg-4 col-sm-6 col-12">
        <div class="product-default-single-item product-color--golden"
            data-aos="fade-up" data-aos-delay="0">
            <div class="image-box">
                <a href="product-details-default.html"
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
                            href="product-details-default.html">${product.name}</a></h6>
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
