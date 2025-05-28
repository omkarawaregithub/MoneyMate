// Middleware functions for MoneyMate Express app

// Logger middleware: logs HTTP method and URL
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// Authentication middleware placeholder
function authenticate(req, res, next) {
  // Implement authentication logic here
  // Example:
  // if (req.user) {
  //   return next();
  // }
  // return res.status(401).json({ message: 'Unauthorized' });
  next();
}

module.exports = {
  logger,
  authenticate,
};