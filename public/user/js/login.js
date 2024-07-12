document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-user')
    const messageModal = document.querySelector('.message')
    const messageStatus = document.querySelector('.message-status')
    const messageMessage = document.querySelector('.message-message')
    const loginError = document.querySelector('.login-error')

    function showPopup(element, success, message) {
        element.style.display = 'flex'
        messageModal.classList.add('message-animation')
        if (success) {
            messageStatus.textContent = 'Success'
            messageStatus.style.color = 'green'
            messageMessage.textContent = message
        } else {
            messageStatus.textContent = 'Failed'
            messageStatus.style.color = 'red'
            messageMessage.textContent = message
        }
        setTimeout(() => {
            element.style.display = 'none'
            // element.textContent = changingValue
        }, 1500);
        return
    }

    loginButton.addEventListener('click', async (event) => {
        event.preventDefault()
        const userCred = document.querySelector('.userCred').value
        const password = document.querySelector('.password').value
        if (!userCred.trim()) {
            showPopup(messageModal, false, 'User credential must be a name or a email.')
            return;
        }

        if (!password.trim()) {
            showPopup(messageModal, false, 'Password must be strong.')
            return;
        }
        console.log('first')
        const response = await axios.post(`/validateLogin`, { password, userCred })
        const data = response.data
        console.log(data)
        if (!data.success) {
            // loginError.style.display = 'block'
            loginError.textContent = data.message
            setTimeout(() => {
                loginError.textContent = ''
            }, 2000);
        }else{
            loginError.textContent = data.message
            loginError.style.color = 'green'
            setTimeout(() => {
                loginError.textContent = ``
                window.location.href = '/user/home'
            }, 2000);
        }
    })

})

console.log('first')