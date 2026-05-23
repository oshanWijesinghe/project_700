
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
 
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);
 
module.exports = router;
 