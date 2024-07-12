
document.addEventListener('DOMContentLoaded', () => {
    const sendOtpButton = document.getElementById('send-otp');
    const verifyOtpButton = document.getElementById('verify-otp');
    const signupButton = document.querySelector('.login_submit button');
    const messageModal = document.querySelector('.message')
    const messageStatus = document.querySelector('.message-status')
    const messageMessage = document.querySelector('.message-message')
    const signupError = document.querySelector('.signup-error')


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

    sendOtpButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sendOtpButton.disabled = true

        const email = document.getElementById('email').value.trim();
        if (!validateEmail(email)) {
            showPopup(messageModal, false, 'Enter a valid email.')
            sendOtpButton.disabled = false
            return;
        }

        const response = await axios.post('/user/sendOtp', { email });
        console.log('response ', response.data)
        const data = response.data
        if (data.success) {
            sendOtpButton.disabled = true
            document.getElementById('email').disabled = true
            setTimeout(() => {
                sendOtpButton.disabled = false
                document.getElementById('email').disabled = false
            }, 30000);
            showPopup(messageModal, data.success, data.message)
            verifyOtpButton.disabled = false;
        } else {
            showPopup(messageModal, data.success, data.message)
            sendOtpButton.disabled = false
        }
    });

    verifyOtpButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const otp = document.getElementById('otp').value.trim();
        if (!otp) {
            showPopup(messageModal, false, 'Enter the otp to verify.')
            return;
        }

        const response = await axios.post(`/user/verifyOtp`, { otp })
        console.log(response.data)
        const data = response.data
        console.log(data)
        if (data.success) {
            showPopup(messageModal, data.success, data.message)
            signupButton.disabled = true
            verifyOtpButton.disabled = true
            document.getElementById('email').disabled = true
            document.getElementById('otp').disabled = true
            signupButton.disabled = false
        } else {
            showPopup(messageModal, data.success, data.message)
        }
    });

    signupButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!name || !password || !confirmPassword || !email) {
            signupError.textContent = 'All field required.'
            signupError.style.color = 'red'
            signupError.style.display = 'block'
            setTimeout(() => {
                signupError.style.display = 'none'
            }, 2000);
            return;
        }

        console.log(password, confirmPassword)
        if (password !== confirmPassword) {
            signupError.textContent = `Password didn't match.`
            signupError.style.color = 'red'
            signupError.style.display = 'block'
            setTimeout(() => {
                signupError.style.display = 'none'
            }, 2000);
            return;
        }

        const response = await axios.post(`/validateSignup`, { name, email, password, confirmPassword })
        const data = response.data
        console.log('validate ',data)
        if(data.errors){
            let errors = data.errors[0].msg
            for (let index = 1; index < data.errors.length; index++){
                errors += `, ${data.errors[index].msg}`;
            }
            // data.errors.forEach(error => {
            //     errors += `, ${error.msg}, `
            // })
            signupError.textContent = errors
            signupError.style.color = 'red'
            signupError.style.display = 'block'
            setTimeout(() => {
                signupError.style.display = 'none'
            }, 2000);
        }else if(!data.success){
            showPopup(messageModal , data.success , data.message)
        }
        if(data.success){
            showPopup(messageModal , data.success , data.message)
            console.log('success')
            window.location.href = `/login`
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
