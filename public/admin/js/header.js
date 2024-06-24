
document.addEventListener('DOMContentLoaded', () => {
    const showSidebarButton = document.querySelector('.show-sidebar')
    
    showSidebarButton.addEventListener('click', () => {
        const sideBar = document.querySelector('.sidebar')
        sideBar.classList.toggle('sidebar-show')
    })
})