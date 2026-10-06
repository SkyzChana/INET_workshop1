var express = require('express');
var router = express.Router();

var userModel = require('../models/user.model');
var productModel = require('../models/product.model');
var orderModel = require('../models/order.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {isAdmin, verifyToken} = require('../middleware/tokken.middleware');


// login 1
router.post('/api/v1/login', async function(req, res, next) {
  try {
  let {username, password} = req.body;
  let user = await userModel.findOne({username});
  if(!user){
    return res.status(400).send({
      status:"400",
      message:"invlid username or password.",
      data:null
    })
  }
  let isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    return res.status(400).send({
      status:"400",
      message:"invlid username or password.",
      data:null
    })
  }if(user.approved ===false){
    return res.status(401).send(
      {
        status:"401",
        message:"wait admin approve.",
        data:null
      }
    )
  }
 // token
 const payload ={
  id : user.id,
  username : user.username,
  role : user.role,
  approved : user.approved
 };
 const SECRET_KEY = process.env.JWT_SECRET_KEY
 const token = await jwt.sign(payload,SECRET_KEY,{expiresIn:'3d'});

  return res.status(200).send({
    status:"200",
    message: "login success.",
    data: [{
      user_id : user.id,
      username : user.username,
      role : user.role,
      approved : user.approved,
      token:token
    }]
    
  }

  );
} catch(error){
  res.status(500).send({
    status:"500",
    message:error,
    data:null
  });
  
}

});

// register 2
router.post('/api/v1/register', async function(req, res, next) {
  try{
  let {username, password} = req.body;
  if (username && password) {
  let existing_user = await userModel.findOne({ username: username })
  if (existing_user) {
    return res.status(400).send({
      status:"400",
      message:"username already exists.",
      data:null
    })
  }else{
    let user = await new userModel({username,password: await bcrypt.hash(password, 10)});
    await user.save();
    return res.status(201).send({
      status:"201",
      message: "resgister success wait admin approve.",
      data:user
  });

  }
  }else{
    return res.status(400).send({
      status:"400",
      message:"username and password is require.",
      data:null
    })
  } 
}catch(error){
  res.status(500).send({
    status:"500",
    message:error,
    data:null
  })
}
});

// approve (only admin can approve) 3 
router.put('/api/v1/users/:id/approve',verifyToken,isAdmin, async function(req, res, next) {
  try{
  let id = req.params.id;
  let user = await userModel.findByIdAndUpdate(id, {approved: true}, {new: true})
  return res.status(200).send({
    status:"200",
    message:"approve success.",
    data : []
  })
  }catch(error){
    res.status(500).send({
    status:"500",
    message:error,
    data:null
  })
  }
});

// get all products 4 // must login first check token
router.get('/api/v1/products',verifyToken, async function(req, res, next) {
  try{
  let product = await productModel.find();
    return res.status(200).send({
      status:"200",
      message:"get product success.",
      data:product
    })

  }catch(error){
    res.status(500).send({
    status:"500",
    message:error,
    data:null
  })
  }
});

// add product 5
router.post('/api/v1/products',verifyToken,isAdmin,async function(req, res, next) {
  try{
  let {name, price,count} = req.body;
  let product = await new productModel({name, price, count});
  await product.save();
  return res.status(201).send({
    status:"201",
    message:"add product success",
    data:{
      name: name,
      price: price,
      count: count
    }
  })
}catch(error){
  return res.status(500).send({
    status:"500",
    message:error,
    data:null
  })
}
});

// get product by id 6
router.get('/api/v1/products/:id',verifyToken,async function(req, res, next) {
  try{
  let {id} = req.params;
  let product = await productModel.findById(id);
  if(!product){
    return res.status(200).send({
      status:"200",
      message:"product not found.",
      data:[]
    })
  }
  return res.status(200).send({
    status:"200",
    message:"get product by id success.",
    data:product
  })
}catch(error){
  res.status(500).send({
    status:"500",
    message:error
  })
}
});

// edit product 7
router.put('/api/v1/products/:id',verifyToken,isAdmin,async function(req, res, next) {
  try{
  let {id} = req.params;
  let {name, price, count} = req.body;
  let product = await productModel.findByIdAndUpdate(id, {name, price, count}, {new: true});
  return res.status(200).send({
    status:"200",
    message:`edit ${ name } success.`,
    data: product
  })
}catch(error){
  res.status(500).send({
    status:"500",
    message:error
  })
}
});

// delete product 8
router.delete('/api/v1/products/:id',verifyToken,isAdmin,async function(req, res, next) {
  try{
  let {id} = req.params;
  let product = await productModel.findByIdAndDelete(id);
  let dataP = product.name
  return res.status(200).send({
    status:"200",
    message:`Delete ${ dataP } success.`,
    data : product
  })
}catch(error){
  res.status(500).send({
    status:"500",
    message:error
  })
}
});

// get all orders 9
router.get('/api/v1/orders',verifyToken,async function(req, res, next) {
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

// show order by product id 10
router.get('/api/v1/products/:id/orders',verifyToken,async function(req, res, next) {
  try{
  let {id} = req.params;
  let order = await orderModel.find({productID :id})
  return res.status(200).send({
    status:"200",
    message:"show order by product id.",
    data:order
  });
}catch(error){
  res.status(500).send({
    status:"500",
    message:error
  })
}

});

router.post('/api/v1/products/:id/orders', verifyToken, async function(req, res, next) {
  try {
    const product_id = req.params.id;
    const { count } = req.body;

    if (!count || count <= 0) {
      return res.status(400).send({
        status: "400",
        message: "invalid item count.",
        data:null
      });
    }

    let productData = await productModel.findById(product_id);
    if (!productData) {
      return res.status(400).send({
        status: "400",
        message: "product not found.",
        data:null
      });
    }

    if (productData.count < count) {
      return res.status(400).send({
        status: "400",
        message: `not enough product, product have ${productData.count}, product needed ${count}`,
        data:null
      });
    }

    productData.count -= count;
    await productData.save();

    let userID = req.user.id;
    let order = new orderModel({
      userID: userID,
      productID: product_id,
      count: count
    });
    await order.save();

    return res.status(201).send({
      status: "201",
      message: "add order success.",
      data: order
    });

  } catch (error) {
    return res.status(500).send({
      status: "500",
      message: error
    });
  }
});

module.exports = router;
