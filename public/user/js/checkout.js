

document.addEventListener('DOMContentLoaded', () => {

    const proceedPayment = document.querySelector('.proceed-payment')
    const district = document.getElementsByName('district')[0]
    const state = document.getElementsByName('state')[0]
    const postOffice = document.getElementsByName('postOffice')[0]
    const addNewAddress = document.querySelector('.add-new-address')
    const addressForm = document.querySelector('.address-form')
    const c = console.log.bind(console)
    const messageModal = document.querySelector('.message')
    const messageStatus = document.querySelector('.message-status')
    const messageMessage = document.querySelector('.message-message')
    const useCoupon = document.querySelectorAll('.promo-code')
    const orderTotal = document.querySelector('.order-total')
    const removeAddressButtons = document.querySelectorAll('.remove-address')




    if (useCoupon) {
        useCoupon.forEach(button => {
            button.addEventListener('click', async (event) => {
                const couponId = event.currentTarget.value
                console.log(couponId)
                const response = await axios.post(`/user/useCoupon?couponId=${couponId}`)
                const data = response.data
                if (data.success) {
                    console.log(data)
                    useCoupon.textContent = 'Remove coupon'
                    orderTotal.innerHTML = `<del>₹${data.actualAmount}</del> ₹${data.payable}`

                }
            })
        })
    }


    if (removeAddressButtons) {
        removeAddressButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                console.log(event.target.value)
                const response = await axios.delete(`/user/removeAddress/${event.target.value}`)
            })
        })
    }


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

    proceedPayment.addEventListener('click', async () => {
        const addresses = document.getElementsByName('address')
        let isAddressChecked = false
        let addressId
        for (const address of addresses) {
            if (address.checked) {
                isAddressChecked = true
                addressId = address.value
            }
        }
        c(addressId)
        if (!isAddressChecked) {
            showPopup(messageModal, false, 'Choose a address to continue')
            return
        }
        let data
        try {
            const response = await axios.post(`/user/create-order`)
            console.log(response)
            console.log(response.data)
            data = response.data
        } catch (error) {
            console.log(error.response.data)
            if (!error.response?.data?.success) {
                showPopup(messageModal, false, 'Check your internet and try again.')
            }
        }
        if (data.success) {
            const options = {
                key: 'rzp_test_PTTWmjoFvKecR5',
                amount: data.Order.amount,
                currency: data.Order.currency,
                order_id: data.Order.id,
                Name: 'Graza lifestyle',
                prefill: {
                    name: 'adhil',
                    email: 'mohamedadhiltp1944@gmail.com',
                    contact: '1238294714'
                },
                handler: async function (response) {
                    try {
                        const paymentStatus = await axios.post(`/user/payment/verify-payment`, { ...response, addressId })
                        const data = paymentStatus.data
                        console.log(data)
                        if (data.success) {
                            showPopup(messageModal, true, 'Order placed successfully')
                            setTimeout(() => {
                                window.location.href = '/user/home'
                            }, 1000)
                            return
                        } else {
                            showPopup(messageModal, false, data.message)
                        }

                    } catch (error) {
                        console.log(error.response.data)
                    }

                },
                theme: '#fef5ef'
            }

            const razorPay = new Razorpay(options)
            razorPay.open()

        }

    })




    const newAddressCreateFunction = async (event) => {
        event.preventDefault()
        let isValid = true;
        console.log('clicked ')

        // Validate each required field
        const requiredFields = ['firstName', 'lastName', 'pin', 'district', 'state', 'postOffice', 'houseAndStreet', 'city'];
        let formData = {}
        requiredFields.forEach(field => {
            const input = document.getElementsByName(field)[0];
            formData[field] = input.value
        });

        // Validate email format
        const emailField = document.getElementsByName('email')[0];
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(emailField.value.trim())) {
            console.log('emial erro')
            isValid = false;
            emailField.style.border = '1px solid red';
        } else {
            formData.email = emailField.value
            emailField.style.border = '';
        }

        // Validate phone number (simple validation)
        const phoneField = document.getElementsByName('phone')[0];
        const phonePattern = /^[0-9]{10,15}$/; // Adjust the pattern according to your needs
        if (!phonePattern.test(phoneField.value.trim())) {
            console.log('phone erro')
            isValid = false;
            phoneField.style.border = '1px solid red';
            phoneField.style.placeContent = 'Enter a valid phone number'
        } else {
            formData.phone = phoneField.value
            phoneField.style.border = '';
        }
        window.scrollTo({
            top: 150,
            behavior: 'smooth'
        })

        // If all validations pass, submit the form
        console.log(isValid)
        if (isValid) {
            try {
                const response = await axios.post(`/user/addAddress`, formData)
                const data = response.data
                console.log('data', data);
                document.querySelector('.addresses').innerHTML += `
                    <div class="col-lg-12 d-flex address">
                                        <div class="d-flex justify-content-start relative input-parent">
                                            <input type="radio" name="address" class="address-input" checked value="${data.newAddress._id}">
                                        </div>
                                        <div class="address-details">
                                            <p>${data.newAddress.firstName}</p>
                                            <p> ${data.newAddress.houseAndStreet},${data.newAddress.postOffice}(PO),${data.newAddress.district}</p>
                                            <p>${data.newAddress.district},${data.newAddress.state}-${data.newAddress.pin}</p>
                                            <p>Mobile :${data.newAddress.phone}</p>
                                            <div class="address-options">
                                                <button href="">Edit</button>
                                                <button class="remove-address" value='${data.newAddress._id}'>Remove</button>
                                            </div>
                                        </div>
                                    </div>
                `
                console.log(addressForm)
                addressForm.reset()

                const disabledFields = addressForm.querySelectorAll(':disabled');
                disabledFields.forEach(field => {
                    console.log('field ', field)
                    field.value = ''; // or set to any desired value
                });
                return
            } catch (error) {
                console.log(error)

                if (!error.response?.data?.success) {
                    messageModal.style.display = 'flex'
                    messageStatus.textContent = 'Failed'
                    messageStatus.style.color = 'red'
                    messageMessage.textContent = error.response.data.message
                    messageModal.classList.add('message-animation')
                    setTimeout(() => {
                        messageModal.style.display = 'none'
                    }, 2000)
                }
                console.log(error.response?.data?.errors)
                error.response?.data?.errors.forEach(err => {
                    console.log(err.path)
                    document.getElementsByName(err.path)[0].style.border = '1px solid red'
                })
            }
            // You can add actual form submission logic here
        } else {
            return
        }

    }


    //-----------------------------------------------------------------------

    addNewAddress.addEventListener('click', () => {
        console.log(addressForm)
        addressForm.style.display = 'flex'
        const pin = document.getElementsByName('pin')[0]
        const addAddress = document.querySelector('.add-address')
        addAddress.addEventListener('click', newAddressCreateFunction)

        function debounce(callback, wait) {
            let timer
            return function (event) {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    callback(event)
                }, wait);

            }
        }
        pin.addEventListener('input', debounce(pinFetchFunction, 500))
    })









    async function pinFetchFunction() {
        const pin = document.getElementsByName('pin')[0]
        const pinValue = pin.value
        console.log(pinValue)
        console.log('checking')
        try {
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pinValue}`)
            const data = response.data
            const postData = data[0]
            console.log('post data', postData)
            if (postData.Status == 'Success') {
                const { District, State } = postData.PostOffice.find(post => post)
                console.log(District, State)
                postOffice.innerHTML = ''
                postData.PostOffice.forEach(office => {
                    const option = document.createElement('option')
                    option.value = office.Name
                    option.textContent = office.Name
                    console.log(option)
                    postOffice.append(option)
                })
                console.log(postOffice)
                state.value = State
                district.value = District
                pin.style.border = ''
            }
        } catch (error) {
            state.value = null
            district.value = null
            postOffice.innerHTML = ''
            return pin.style.border = '1px solid red'
        }


    }



})