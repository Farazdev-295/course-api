const User = require('../models/User');

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    const errors = [];
    if (!name || !String(name).trim()) errors.push('name is required');
    if (!email) errors.push('email is required');
    else if (!isEmail(email)) errors.push('email must be a valid email');
    if (!password) errors.push('password is required');
    else if (String(password).length < 6)
      errors.push('password must be at least 6 characters');

    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Validation failed', errors });
    }

    // Check duplicate
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    const errors = [];
    if (!email) errors.push('email is required');
    if (!password) errors.push('password is required');

    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Validation failed', errors });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse(user)
    });
  } catch (err) {
    next(err);
  }
};