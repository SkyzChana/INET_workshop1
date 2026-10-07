var express = require('express');
var router = express.Router();

var orderModel = require('../models/order.model');

const {isAdmin, verifyToken} = require('../middleware/token.middleware');

// get all orders 
router.get('/',verifyToken,isAdmin,async function(req, res, next) {
  try{
    let order = await orderModel.find();
    return res.status(200).send({
      status:"200",
      message:"get all order.",
      data:order
    });
  }catch(error){
    res.status(500).send({
      status:"500",
      message:error
    })
  }
});

module.exports = router;
