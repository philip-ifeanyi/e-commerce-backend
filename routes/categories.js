const Category = require('../models/category')
const express = require('express');
const router = express.Router();

// Get categories
router.get('/', async (req, res) => {
  const categories = await Category.find();

  if(!categories) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }
  res.status(201).json({
    success: true,
    categories
  })
});

// Get single category
router.get('/:category_id', async (req, res) => {
  const category = await Category.findById(req.params.category_id);
  if(!category) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }
  res.status(201).json({
    success: true,
    category
  })
})

// Add categories
router.post('/', async (req, res) => {
  const { name, color, icon } = req.body
  const categoryObj = new Category({
    name, color, icon
  })
  if(!categoryObj) {
    return res.status(500).json({success: false, message: 'Internal Error'})
  }

  const category = await categoryObj.save()
  return res.status(201).json({
    success: true,
    message: "category added successfully",
    category
  })
});

// Update a category
router.put('/:category_id', async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.category_id, req.body, {new: true})
  if(!category) {
    return res.status(500).json({success: false, message: 'Internal Error'})
  }
  return res.status(201).json({
    success: true,
    message: "category updated successfully",
    category
  })
})

// Delete a category
router.delete('/:category_id', (req, res) => {
  Category.findByIdAndDelete(req.params.category_id)
    .then(category => {
      if(category) {
        return res.status(200).json({success: true, message: "category deleted successfully"})
      } else {
        return res.status(404).json({success:false, message: "category not found!"})
      }
    }).catch(error => {
      return res.status(400).json({success:false, error: error});
    })
})

module.exports = router