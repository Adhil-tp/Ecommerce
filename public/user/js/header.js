const showShop = document.querySelector('.show-shop')
const shopList = document.querySelector('.shop-sidebar-list')
const showSideBar = document.querySelector('.show-sidebar')
const sidebar = document.querySelector('.sidebar')


showShop.addEventListener('click' , ()=> {
    shopList.classList.toggle('show')
})

showSideBar.addEventListener("click" , ()=> {
    sidebar.style.display = 'flex'
    document.querySelector('.close-sidebar').addEventListener('click' , ()=> {
        sidebar.style.display = 'none'
    })
})

window.addEventListener('scroll', ()=> {
    sidebar.style.display = 'none'
})
