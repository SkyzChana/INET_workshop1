const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send({status:"401",
      message: "access denied. no token provided.",
      data:null });
  }
  
  const token = authHeader.replace("Bearer ","")
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    req.user = decoded;
    if(req.user.approved===true){
      next();
    }else{
      return res.status(401).send({
        status:"403",
        message:"u have to approve first before use this function.",
        data:null})
    }
  } catch (err) {
    return res.status(401).send({ 
      status:"401",
      message: "invalid or expired token.",
      data:null });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    return res.status(403).send({ 
      status:"403",
      message: "access denied. admin role required." });
  }
}
//export function go go go
module.exports = { verifyToken, isAdmin };