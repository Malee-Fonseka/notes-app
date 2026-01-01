const jwt = require('jsonwebtoken')

function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return response.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return response.status(403).json({ message: "Invalid or expired token" });
    }
    request.user = user
    next()
  })
}

module.exports = {
  authenticateToken
}