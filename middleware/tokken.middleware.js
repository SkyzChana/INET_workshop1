const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // แยกคำว่า "Bearer " ออกจาก token

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

// 2. Middleware สำหรับตรวจเช็กว่าเป็น Admin หรือไม่
function isAdmin(req, res, next) {
  // req.user ถูกส่งต่อมาจาก verifyToken
  if (req.user && req.user.role === 'admin') {
    next(); // ถ้าเป็น admin ให้ผ่านไปทำส่วนถัดไปได้
  } else {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
}

module.exports = { verifyToken, isAdmin };