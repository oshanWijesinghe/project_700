const express = require('express');
const cartRouter = express.Router();
const orderRouter = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { getOrders, getOrder, createOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
 
// All cart routes require authentication
cartRouter.use(authenticate);
cartRouter.get('/', getCart);
cartRouter.post('/', addToCart);
cartRouter.put('/:id', updateCartItem);
cartRouter.delete('/clear', clearCart);
cartRouter.delete('/:id', removeFromCart);
 
// All order routes require authentication
orderRouter.use(authenticate);
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrder);
orderRouter.post('/', createOrder);
 
module.exports = { cartRouter, orderRouter };
 