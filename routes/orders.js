const Order = require('../models/order')
const OrderItem = require('../models/orderItem')
const express = require('express')

const router = express.Router()

router.get('/', async (req, res) => {
  const orders = await Order.find().popilate('user', 'name').sort({'dateOrdered': -1})//order from newest to oldest

  if(!orders) return res.status(404).json({success: false, message: "Order not found"})

  res.status(200).json({success: true, orders})
});

router.get('/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name')
    .populate({
      path: 'orderItems', 
      populate: { 
        path: 'product', 
        populate: 'category'
      }
    })

  if(!order) return res.status(404).json({success: false, message: "Order not found"})

  res.status(200).json({success: true, order})
});

// Add categories
router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product
    })

    newOrderItem = await newOrderItem.save()
    return newOrderItem._id
  }))

  const orderItemsIdsResolved = await orderItemsIds

  const totalPrices = await Promise.all(orderItemsIdsResolved.map( async orderItemId => {
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
    const totalPrice = orderItem.product.price * orderItem.quantity
    return totalPrice
  }))

  const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

  const { shippingAddress1, shippingAddress2, city, zip, country, phone, status, user } = req.body
  const orderObj = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    totalPrice,
    user
  })

  if(!orderObj) {
    return res.status(500).json({success: false, message: 'Internal Error'})
  }

  const order = await orderObj.save()
  return res.status(201).json({
    success: true,
    message: "category added successfully",
    order
  })
});

// Update Order
router.put('/:orderId', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.orderId, {status: req.body.status}, {new: true})

  if(!order) return res.status(404).json({success: false, message:"Not Found"})

  return res.status(201).json({
    success: true,
    message: "category updated successfully",
    order
  })
})

// Delete Order
router.delete('/:order_id', (req, res) => {
  Order.findByIdAndDelete(req.params.category_id)
    .then(async order => {
      if(order) {
        await order.orderItems.map(async orderItem => {
          await OrderItem.findByIdAndDelete(orderItem)
        });
        return res.status(200).json({success: true, message: "order deleted successfully"})
      } else {
        return res.status(404).json({success:false, message: "order not found!"})
      }
    }).catch(error => {
      return res.status(500).json({success:false, error: error});
    })
})

// Get Total Amount of Sales
router.get('/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    {$group: {_id:null, totalsales: {$sum: '$totalPrice'}}}
  ])
})

module.exports = router