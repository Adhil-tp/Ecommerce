document.addEventListener('DOMContentLoaded' , ()=> {
    const loginButton = document.querySelector('.login-button')
    const registerButton = document.querySelector('.register-button')
    
    const loginForm = document.querySelector('.login-form')
    const registerForm = document.querySelector('.register-form')
    
    console.log('heyy there how are you ')
    
    loginButton.addEventListener('click' , ()=> {
        console.log('clied')
        loginForm.style.display = 'block'
        registerForm.style.display = 'none'
    })
    registerButton.addEventListener('click' , ()=> {
        registerForm.style.display = 'block'
        loginForm.style.display = 'none'
    })
})