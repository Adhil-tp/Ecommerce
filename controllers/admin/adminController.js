const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const Product = require('../../model/product')
const Order = require('../../model/order')
const User = require('../../model/user')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const order = require('../../model/order')




async function showOrder(req, res) {
    try {
        const orders = await Order.aggregate([
            { $match: {} },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productObject'
                }
            },
            { $unwind: '$productObject' },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: 'addressObject'
                }
            },
            { $unwind: { path: '$addressObject', preserveNullAndEmptyArrays: true } },
            { $sort: { orderedDate: -1 } }

        ])
        // console.log(typeof ordersList[0])
        // const orders = ordersList.map(order => order.toObject())

        orders.forEach(object => {
            object.orderedDate = new Date(object.orderedDate).toLocaleDateString('en-GB')
            object.deliveryDate = new Date(object.deliveryDate).toLocaleDateString('en-GB')
        });


        const paginationLength = Math.ceil(orders.length / 20)
        res.render('admin/orders', { title: 'orders', orders, paginationLength })
    } catch (error) {
        console.log(error.message)
    }
}

async function showDash(req, res) {
    const chartData = [
        { label: 'January', value: 10 },
        { label: 'February', value: 20 },
        { label: 'March', value: 30 },
        { label: 'April', value: 30 },
        { label: 'May', value: 50 },
        { label: 'June', value: 60 },
    ];
    const userSignups = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
            $project: {
                _id: 0,
                label: {
                    $concat: [
                        {
                            $arrayElemAt: [
                                ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                                { $subtract: ["$_id.month", 1] }
                            ]
                        },
                        " ",
                        { $toString: "$_id.year" }
                    ]
                },
                value: "$count"
            }
        }
    ]);
    const totalProducts = await Product.countDocuments();
    const categoryPie = await Product.aggregate([
        {
            $lookup: {
                from: 'categories', // Replace with your category collection name
                localField: 'category', // The field in the Product model
                foreignField: '_id', // The field in the Category model
                as: 'categoryDetails'
            }
        },
        {
            $unwind: '$categoryDetails'
        },
        {
            $group: {
                _id: '$categoryDetails.name',
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                category: '$_id',
                count: 1,
                percentage: {
                    $multiply: [
                        { $divide: ['$count', totalProducts] },
                        100
                    ]
                }
            }
        }
    ])
    const overallSale = await Product.aggregate([
        {
            $match: { sold: { $gt: 0 } } // Match documents where sold quantity is greater than 0
        },
        {
            $group: {
                _id: null,
                totalSales: {
                    $sum: {
                        $multiply: ["$sold", { $ifNull: ["$offerPrice", "$price"] }]
                    }
                }
            }
        }
    ]);
    console.log(overallSale)
    res.render('admin/dashboard', { title: 'Dashboard', chartData, userSignups, categoryPie, overallSale })
}
async function orderUpdate(req, res) {
    try {
        const { orderId, method } = req.query
        if (orderId) {
            let orderDetails
            orderDetails = await Order.findOne({ _id: orderId })
            console.log('order details ', orderDetails)
            if (orderDetails.status == 'Pending') {
                if (method == 'deliver') {
                    await Order.updateOne({ _id: orderId }, { status: 'Delivered' })
                    res.status(200).json({ success: true, message: 'Order Delivered updated.' })
                } else if (method == 'cancel') {
                    await Product.updateOne({ _id: orderDetails.product }, { $inc: { stock: orderDetails.quantity } })
                    await Order.updateOne({ _id: orderId }, { status: 'Canceled' })
                    res.status(200).json({ success: true, message: 'Order Canceled succesfully' })
                }
            } else if (orderDetails.status == 'Canceled') {
                res.status(200).json({ success: false, message: 'Order already Canceled.' })
            }
        } else {
            return res.status(200).json({ success: false, message: 'Invalid order' })
        }
    } catch (error) {
        console.log(error.message)
    }
}
async function getOrders(req, res) {
    try {
        const { fromDate, toDate, pageNumber } = req.query

        if (fromDate && toDate) {
            function convertToYearDayMonthFormat(dateString) {
                const date = new Date(dateString);

                // Extract the year, month, and day
                const year = date.getFullYear();
                const day = String(date.getDate()).padStart(2, '0'); // getDate() returns the day of the month
                const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11

                // Define the time part
                const timePart = 'T00:00:00.000+00:00';

                // Format the date as year-day-month with the time part
                const dateObj = `${year}-${day}-${month}${timePart}`
                return new Date(dateObj)
            }
            // Convert strings to Date objects
            const fromDateObj = convertToYearDayMonthFormat(fromDate);
            const toDateObj = convertToYearDayMonthFormat(toDate);
            console.log('From Date:', fromDateObj, typeof fromDateObj);
            console.log('To Date:', toDateObj, typeof toDateObj);

            // Check if toDate is earlier than fromDate
            if (toDateObj < fromDateObj) {
                console.log('date error')
                res.status(400).json({ success: false, message: 'Provide a proper date range, please.' });
            } else {
                const orders = await Order.aggregate([
                    {
                        $match: {
                            orderedDate: {
                                $gte: new Date(fromDateObj),
                                $lte: toDateObj
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'productObject'
                        }
                    },
                    { $unwind: '$productObject' },
                    {
                        $lookup: {
                            from: 'addresses',
                            localField: 'address',
                            foreignField: '_id',
                            as: 'addressObject'
                        }
                    },
                    { $unwind: { path: '$addressObject', preserveNullAndEmptyArrays: true } },
                    { $sort: { orderedDate: -1 } }

                ])
                orders.forEach(object => {
                    object.orderedDate = new Date(object.orderedDate).toLocaleDateString('en-GB')
                    object.deliveryDate = new Date(object.deliveryDate).toLocaleDateString('en-GB')
                });
                if (orders.length) {
                    res.status(200).json({ success: true, orders });
                } else {
                    res.status(200).json({ success: false, message: 'No orders found in the given date range' })
                }
            }
        } else if (pageNumber) {
            try {
                const skipUpto = (pageNumber - 1) * 20
                console.log(typeof skipUpto)
                const orders = await Order.aggregate([
                    {
                        $match: {}
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'productObject'
                        }
                    },
                    { $unwind: '$productObject' },
                    {
                        $lookup: {
                            from: 'addresses',
                            localField: 'address',
                            foreignField: '_id',
                            as: 'addressObject'
                        }
                    },
                    { $unwind: { path: '$addressObject', preserveNullAndEmptyArrays: true } },
                    { $sort: { orderedDate: -1 } },
                    { $skip: skipUpto },
                    { $limit: 20 }

                ])
                orders.forEach(object => {
                    object.orderedDate = new Date(object.orderedDate).toLocaleDateString('en-GB')
                    object.deliveryDate = new Date(object.deliveryDate).toLocaleDateString('en-GB')
                });
                if (orders.length) {
                    return res.status(200).json({ success: true, orders })
                }
                res.status(200).json({ success: false, message: 'No orders found.' })
            } catch (error) {
                console.log('skip ' , error.message)
                res.status(200).json({ success: false, message: '', error: 404 })
            }
        }


    } catch (error) {
        console.log('skip',error.message)
    }
}

module.exports = {
    showOrder,
    orderUpdate,
    getOrders,
    showDash
}