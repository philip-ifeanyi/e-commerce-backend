function errorHandler(err, req, res, next) {
  if(err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      name: err.name,
      message: err.message
    })
  }

  if(err.name === 'ValidationError') {
    res.status(401).json({
      success: false,
      name: err.name,
      message: err.message
    })
  }
}

module.exports = errorHandler