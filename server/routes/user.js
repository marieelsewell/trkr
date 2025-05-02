const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');

// CREATE
// ------------------------------------------------------------------------------------------------------------------------

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    // if a validation error occurs
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(422).json({ success: false, message: messages });
    } else if (error.code == 11000) {
      return res.status(422).json({ success: false, message: 'Email already exists' });
    } else {
      console.error('Error registering user:', error); 
      res.status(500).json({ success: false, message: 'Error registering user', error });
    }
  }
});

// Authenticate user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      req.session.user = user._id;
      req.session.save((err) => {
          if (err) {
              console.error('Error saving session:', err);
              return res.status(500).json({ success: false, message: 'Error saving session' });
          }
          console.log('User authenticated and session saved:', req.session.user); 
          res.status(200).json({ success: true, message: 'User authenticated successfully' });
      });
  } catch (error) {
      console.error('Error authenticating user:', error); 
      res.status(500).json({ success: false, message: 'Error authenticating user', error });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.user = null;
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.status(200).json({ success: true, message: 'User logged out successfully' });
  });
});



// RETRIEVE
// ------------------------------------------------------------------------------------------------------------------------

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});

// get session
router.get('/session', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ success: true, user: req.session.user });
  }
  res.status(404).json({ success: false, message: 'Session not found' });
});

/// get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
});


// get user by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});



// UPDATE
// ------------------------------------------------------------------------------------------------------------------------



module.exports = router;