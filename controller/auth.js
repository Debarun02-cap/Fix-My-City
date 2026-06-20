const User = require('../models/user');


exports.getIndex = (req, res, next) => {
  res.json({ message: "Auth API running" });
}

exports.getLogin = (req, res, next) => {
  res.json({ success: true, message: 'Login page' });
}

exports.postLogin = (req, res, next) => {
  const identifier = req.body.username || req.body.email || req.body.mobile;
  const { password, role } = req.body;
  console.log('Login attempt:', identifier, role);

  User.findByCredentials(identifier, password, role, (user) => {
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    req.session.user = {
      id: user._id ? user._id.toString() : user.id,
      role: user.role,
      name: user.firstname
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
      res.json({
        success: true,
        message: "Login successful",
        user: req.session.user
      });
    });
  });
}

exports.getSignup = (req, res, next) => {
  res.json({ success: true, message: 'Signup page' });
}

exports.postSignup = (req, res, next) => {
  const { firstname, lastname, email, mobile, address, city, state, aadhar, password, role } = req.body;
  const user = new User(firstname, lastname, email, mobile, address, city, state, aadhar, password, role);

  user.save().then(() => {
    res.status(200).json({
      success: true,
      message: "User registered successfully"
    });
  }).catch(err => {
    console.error('Error saving user:', err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
}