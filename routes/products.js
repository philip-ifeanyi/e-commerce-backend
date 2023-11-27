const Category = require('../models/category');
const Product = require('../models/product')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error('invalid image type')

    if (!isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, res, cb) {
    const fileName = file.originalName.split(' ').join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({storage: storage})

// Get all products
router.get('/', async (req, res) => {
  let filter = {}
  const { category, count } = req.query
  filter = category ? {...filter, category} : filter

  const products = await Product.find(filter).limit(count).populate('category');

  if(!products) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }
  res.status(201).json({
    success: true,
    products
  })
});

// Get one product
router.get('/:product_id', async (req, res) => {
  // Validete product product id
  if(!mongoose.isValidObjectId(req.params.product_id)){
    res.status(400).json({error: "Invalid Product Id"});
  }

  const product = await Product.findById(req.params.product_id).populate('category');

  if(!product) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }

  res.status(201).json({
    success: true,
    product
  })
});

// Add one product
router.post('/', uploadOptions.single('image'), async (req, res) => {
  const newCategory = await Category.findById(req.body.category);
  if(!newCategory) return res.status(400).json({error: "Invalid category"});

  const file = req.file
  if(!file) return res.status(400).json({error: "No file in the request"});

  const fileName = req.file.filename
  let basePath = `${req.protocol}://${req.get.host}/public/uploads`;

  const { name, description, richDescription, brand, price, category, countInStock, rating, numReviews, isFeatured } = req.body;
  const productObj = new Product({
    image: `${basePath}${fileName}`, name, countInStock, description, richDescription, category, price, brand, rating, numReviews, isFeatured
  })

  const product = await productObj.save()
  if(!product) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }
  res.status(201).json({
    success: true,
    product
  })
})

// Update a product
router.put('/:product_id', async (req, res) => {
  // Validete product product id
  if(!mongoose.isValidObjectId(req.params.product_id)){
    return res.status(400).json({error: "Invalid Product Id"});
  }

  const newCategory = await Category.findById(req.body.category);
  if(!newCategory) return res.status(400).json({error: "Invalid category"});

  const product = await Product.findByIdAndUpdate(req.params.product_id, req.body, {new: true})
  if(!product) {
    return res.status(500).json({success: false, message: 'Internal Error'})
  }
  return res.status(201).json({
    success: true,
    message: "product updated successfully",
    product
  })
})

// Add gallery images
router.put(
  '/gallery-images/:product_id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    // Validete product product id
    if(!mongoose.isValidObjectId(req.params.product_id)){
      return res.status(400).json({error: "Invalid Product Id"});
    }

    const files = req.files
    let imagePaths = [];
    let basePath = `${req.protocol}://${req.get.host}/public/uploads`;

    if(files) {
      files.map(file => {
        imagePaths.push(`${basePath}${file.filename}`);
      })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.product_id,
      {
        images: imagePaths
      },
      {new: true}
    )

    if(!product) {
      return res.status(500).json({success: false, message: 'Internal Error'})
    }
    return res.status(201).json({
      success: true,
      message: "product updated successfully",
      product
    })
  }
)

// Delete a product
router.delete('/:product_id', (req, res) => {
  Product.findByIdAndDelete(req.params.product_id)
    .then(product => {
      if(product) {
        return res.status(200).json({success: true, message: "product deleted successfully"})
      } else {
        return res.status(404).json({success:false, message: "product not found!"})
      }
    }).catch(error => {
      return res.status(400).json({success:false, error: error});
    })
})

module.exports = router