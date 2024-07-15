
const searchByCategory = document.getElementById('search-category')
const searchInput = document.getElementById('search-product')
const products = document.querySelector('.product-container')
const paginationButtons = document.querySelectorAll('.pagination-button')
const paginationContainer = document.querySelector('.pagination')
const editProductButtons = document.querySelectorAll('.edit-product')


const paginationFunction = () => {
    const paginationButtons = document.querySelectorAll('.pagination-button')

    paginationButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const paginationValue = event.target.value
            const response = await axios.get(`/admin/api/getProductsByPagination/${paginationValue}/${chosenCategoryId}`)
            const data = response.data
            if (!data.error) {
                showProductsFunction(data)
            }

        })
    })
}


const fetchBySearch = async () => {
    const searchValue = document.getElementById('search-product').value
    const searchResultList = document.querySelector('.search-result')
    let response
    let data
    if (searchValue) {
        response = await axios.get(`/admin/api/searchingProducts/${searchValue}`)
        data = response.data
    } else {
        return
    }
    searchResultList.innerHTML = ''
    if (!data.error) {
        data.searchResult.forEach(product => {
            const li = document.createElement('li')
            li.innerHTML = `
                <img src="/images/products/${product.mainImage}" alt="">
                <p class="product-name">${product.name}</p>
                <p class="product-price"><small>${product.price}</small></p>
            `
            searchResultList.appendChild(li)
        })
        return
    } else if (data.error) {
        if (data.dataLength == 0) {
            const li = document.createElement('li')
            li.innerHTML = `
                    <p class="product-name">${data.message}</p>
                `
            searchResultList.appendChild(li)
        }
    }

}


function debounce(callback, wait) {
    let timer
    return () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            callback()
        }, wait);
    }
}

const debounceFunction = debounce(fetchBySearch, 400)

searchInput.addEventListener('input', debounceFunction)

let chosenCategoryId

const showProductsFunction = (data) => {
    products.innerHTML = ``
    data.sortedProducts.forEach(element => {
        const newProduct = `
            <div class="product dfc" data-Id="${element._id}">
                <div>
                    <img src="/images/products/${element.mainImage}" style="object-fit: cover; width: 100%; height: 100%;" alt="">
                </div>
                <div>
                    <h4>${element.name}</h4>
                    <div class="df gap">
                        ${element.offerPrice ? `<h4>₹${element.offerPrice}</h4><h4><del class="red">₹${element.price}</del></h4>` : `<h4>₹${element.price}</h4>`}
                    </div>
                </div>
                <div class="product-buttons df">
                    <a value="${element._id}" href="/admin/editProduct?productId=${element._id}" class="edit-product">Edit</a>
                    <a value="${element._id}" href="/admin/disableProduct?productId=${element._id}" class="disable-product">Disable</a>
                </div>
            </div>
            `;
        products.innerHTML += newProduct;

    });
    const paginationLength = data.paginationLength
    paginationContainer.innerHTML = ''
    for (let i = 1; i <= paginationLength; i++) {
        const element = `
                        <button class="pagination-button" value="${i}">
                            ${i}
                        </button>
                        `
        paginationContainer.innerHTML += element

    }
    paginationFunction()

}

searchByCategory.addEventListener('change', async () => {
    const searchingCategory = searchByCategory.value
    const response = await axios.get(`/admin/api/getProductByCategory/${searchingCategory}`)
    const data = await response.data
    if (!data.error) {
        showProductsFunction(data)
        chosenCategoryId = searchingCategory
    }
})



paginationFunction()



// editProductButtons.forEach(editButton => {
//     editButton.addEventListener('click', async (event) => {
//         const productId = event.target.value
//         console.log(productId)
//         const response = await axios.get(`/admin/editProduct?id=${productId}`)
//         const data  = response.data
//         console.log(data)
        
//         window.location.href =  `/admin/editProduct`
//     })
// })