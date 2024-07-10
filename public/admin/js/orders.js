

const cancelOrder = document.querySelectorAll('.show-cancel-modal')
const deliverOrder = document.querySelectorAll('.deliver-order')
const myModal = new bootstrap.Modal(document.querySelector('#staticBackdrop'))
const dateDropDownMene = document.querySelector('.dropdown-menu')
const orderBody = document.querySelector('.order-body')
const paginationButtons = document.querySelectorAll('.pagination-button')
const CancelConfirm = document.querySelector('.cancel-order')


async function cancelOrderFunction() {
    try {
        const response = await axios.post(`/admin/order-update?orderId=${CancelConfirm?.value}&method=cancel`)
        const data = response.data
        console.log(`.badge-${CancelConfirm?.value}`)
        console.log(data)
        if (data.success) {
            const orderBadge = document.querySelector(`.badge-${CancelConfirm?.value}`)
            console.log(orderBadge)
            orderBadge.classList.remove('text-bg-warning', 'text-bg-success')
            orderBadge.classList.add('text-bg-danger')
            orderBadge.textContent = 'Canceled'
            document.querySelector(`.deliver-order-${CancelConfirm?.value}`).disabled = true
            document.querySelector(`.cancel-order-${CancelConfirm?.value}`).disabled = true
            // window.location.href = '/admin/orders'

            console.log('canceled order')
        }
    } catch (error) {
        console.log(error.message)
    }
}
async function deliverOrderFunction() {
    const response = await axios.post(`/admin/order-update?orderId=${CancelConfirm?.value}&method=deliver`)
    const data = response.data
    console.log(data)
    if (data.success) {
        const orderBadge = document.querySelector(`.badge-${CancelConfirm?.value}`)
        console.log(orderBadge)
        orderBadge.classList.remove('text-bg-warning', 'text-bg-danger')
        orderBadge.classList.add('text-bg-success')
        orderBadge.textContent = 'Delivered'
        document.querySelector(`.deliver-order-${CancelConfirm?.value}`).disabled = true
        document.querySelector(`.cancel-order-${CancelConfirm?.value}`).disabled = true
    }
}


const truncateId = (id) => id.substring(0, 5) + '...'


function changeOrderList(data) {
    orderBody.innerHTML = ''
    data.orders.forEach(order => {
        const newOrder = document.createElement('tr')
        newOrder.classList.add(`order-card-${order._id}`)

        try {
            newOrder.innerHTML = `
                        <td>
                          ${truncateId(order._id.toString())}
                        </td>
                        <td>
                          ${order.addressObject?.firstName}
                        </td>
                        <td>
                          ${order.addressObject?.houseAndStreet} <br>,
                            ${order.addressObject?.postOffice}(PO)
                        </td>
                        <td>
                          ${order.orderedDate}
                        </td>
                        <td>
                          ${order.deliveryDate}
                        </td>
                        <td>
                          <span
                            class="badge ${order.status == 'Pending' ? 'text-bg-warning' : order.status == 'Canceled' ? 'text-bg-danger' : 'text-bg-success'}">
                            ${order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            class="btn btn-outline-success btn-sm deliver-order ${order.status == 'Pending' ? '' : 'disabled'} "
                            value="${order._id}">
                            ${`${order.status == 'Pending' ? 'Delivered' : 'Delivered'} `}
                          </button>
                        </td>
                        <td>
                          
                          <button type="button" class="btn btn-outline-danger btn-sm show-cancel-modal ${order.status == 'Canceled' ? 'disabled' : ''}" data-bs-toggle="modal"
                            data-bs-target="#staticBackdrop">Cancel</button>

                          <!-- Modal -->
                          <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
                            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div class="modal-dialog">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h1 class="modal-title fs-5" id="staticBackdropLabel">Confirmation</h1>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                  Are you sure you want to perform this operation?
                                </div>
                                <div class="modal-footer">
                                  <button type="button" class="btn btn-outline-success btn-sm" data-bs-dismiss="modal">No</button>
                                  <button type="button" value="${order._id}" class="btn btn-outline-danger btn-sm cancel-order">Yes</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                `
            orderBody.appendChild(newOrder)
        } catch (err) {
            console.log(err.message)
        }

    })
    const cancelOrder = document.querySelectorAll('.cancel-order')
    const deliverOrder = document.querySelectorAll('.deliver-order')


    cancelOrder.forEach(button => {
        button.addEventListener('click', (event) => {
            CancelConfirm.value = event.target?.value
            CancelConfirm.addEventListener('click', cancelOrderFunction)

        })
    })
    deliverOrder.forEach(button => {
        button.addEventListener('click', (event) => {
            CancelConfirm.value = event.target?.value
            CancelConfirm.addEventListener('click', deliverOrderFunction)

        })
    })

}

cancelOrder.forEach(button => {
    button.addEventListener('click', (event) => {
        CancelConfirm.value = event.target?.value
        CancelConfirm.addEventListener('click', cancelOrderFunction)

    })
})


// setTimeout(() => {
//     // orderBody.innerHTML = ''
// }, 2000);

deliverOrder.forEach(button => {
    button.addEventListener('click', (event) => {
        CancelConfirm.value = event.target?.value
        CancelConfirm.addEventListener('click', deliverOrderFunction)

    })
})



paginationButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        console.log(event.target.value)
        const response = await axios.get(`/admin/getOrders?pageNumber=${event.target.value}`)
        const data = response.data
        if (data.success) {
            changeOrderList(data)
        }
    })
})



async function getByDateFunction(event) {
    event.preventDefault()
    cancelOrder.forEach(button => {
        button.removeEventListener('click', cancelOrderFunction)
        button.removeEventListener('click', deliverOrderFunction)
    })
    const fromDate = document.getElementById('from-date').value
    const toDate = document.getElementById('to-date').value
    if (!fromDate || !toDate) {
        document.querySelector('.date-error').style.display = 'block'
    } else {

        try {
            document.querySelector('.date-error').style.display = 'none'
            const response = await axios.get(`/admin/getOrders?fromDate=${fromDate}&toDate=${toDate}`)
            const data = response.data
            if (data.success) {
                changeOrderList(data)
            }
        } catch (error) {

        }

    }
}






const getOrdersByDate = document.querySelector('.get-orders-by-date')
getOrdersByDate.addEventListener('click', getByDateFunction)