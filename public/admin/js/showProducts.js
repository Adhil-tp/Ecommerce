
const searchByCategory = document.getElementById('search-category')
const products = document.querySelector('.products')

searchByCategory.addEventListener('change', async () => {
    const searchingCategory = searchByCategory.value
    console.log()
    const response = await axios.get(`/admin/api/getProductByCategory/${searchingCategory}`)
    const data = await response.data
    console.log(data)
    if (!data.error) {
        console.log('this is products', products)
        products.innerHTML = ``
        data.products.forEach(element => {
            const newProduct = `
            <div class="product dfc" data-Id="${element._id}">
                <div>
                    <img src="/images/products/${element.mainImage}" style="object-fit: cover; width: 100%; height: 100%;" alt="">
                </div>
                <div>
                    <h4>${element.name}</h4>
                    <div class="df gap">
                        ${element.offerPrice ? `<h3>${element.price}</h3><h3><del class="red">${element.offerPrice}</del></h3>` : `<h3>${element.price}</h3>`}
                    </div>
                </div>
                <div class="product-buttons df">
                    <button>Edit</button>
                    <button>Delete</button>
                </div>
</div>`;
            products.innerHTML += newProduct;

        });
    }
})