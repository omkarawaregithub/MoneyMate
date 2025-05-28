import express from 'express'
import User from '../models/User.js'
const router = express.Router()

// For Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    }).select('-password')

    if (user) {
      res.send(user)
    } else {
      res.status(500).json('Error')
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// For Register
router.post('/register', async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email })

    if (userExists) {
      res.status(400)
      throw new Error('User already exists')
    } else {
      const newuser = new User(req.body)
      await newuser.save()
      res.send('User Registered Successfully')
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// For Updating User Profile
router.put('/update-profile', async (req, res) => {
  try {
    const { userId, ...updatedFields } = req.body
    const user = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    }).select('-password')

    if (user) {
      res.send(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
