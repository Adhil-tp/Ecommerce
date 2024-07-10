const addToCartButtons = document.querySelectorAll('.add-to-cart')
const cartCount = document.querySelector('.cart-count')

addToCartButtons.forEach(button => {
    button.addEventListener('click' , async(event)=> {
        console.log(event.target.dataset.productid)
        const productId = event.target?.dataset?.productid
        try{
            const response = await axios.post(`/user/addToCart/${productId}/${1}`)
            cartCount.textContent = response.data?.cartLength
        }catch(error){
            console.log(error)
        }
    })
});