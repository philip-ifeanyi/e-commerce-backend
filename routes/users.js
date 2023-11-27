const User = require('../models/user');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  if(!users) return res.status(500).json({
    success: false,
    error: "Internal error"
  });

  res.status(201).json({
    success: true,
    users
  })
})

// Get one user
router.get('/:user_id', async (req, res) => {
  // Validete user user id
  if(!mongoose.isValidObjectId(req.params.user_id)){
    res.status(400).json({error: "Invalid user Id"});
  }

  const user = await User.findById(req.params.user_id).select('-passwordHash');

  if(!user) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }

  res.status(201).json({
    success: true,
    user
  })
});

// Add one user
router.post('/register', async (req, res) => {
  const { name, email, password, isAdmin, street, city, apartment, zip, country, phone } = req.body;

  const alreadyExist = await User.findOne({email})
  if(alreadyExist) return res.status(400).json({success: false, message:"User already exists"});

  const userObj = new User({
    isAdmin,
    name,
    zip,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    apartment,
    street,
    country,
    phone,
    city
  })

  const user = await userObj.save()
  if(!user) {
    res.status(500).json({
      success: false,
      message: 'Internal error'
    })
  }
  res.status(201).json({
    success: true,
    user
  })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if(!user) return res.status(400).json({success: false, message: 'User not found'})

  if(user && bcrypt.compare(password, user.passwordHash)){
    const token = jwt.sign({
      username: user.name,
      email: user.email,
      id: user.id,
      isAdmin: user.isAdmin
    }, process.env.SECRET, {
      expiresIn: "1d"
    })
    
    res.status(201).json({
      success: true,
      message: 'User Found',
      user,
      token
    })
  } else {
    if(!user) return res.status(400).json({success: false, message: 'Wrong password'})
  }
})

module.exports = router