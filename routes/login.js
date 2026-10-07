var express = require('express');
var router = express.Router();

var userModel = require('../models/user.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// login 
router.post('/login', async function(req, res, next) {
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
    if(user.approved ===false){
      return res.status(401).send(
        {
          status:"401",
          message:"wait admin approve.",
          data: {
            user_id : user.id,
            username : user.username,
            role : user.role,
            approved : user.approved,
            token:token
          }
        }
      )
    }

    return res.status(200).send({
      status:"200",
      message: "login success.",
      data: {
        user_id : user.id,
        username : user.username,
        role : user.role,
        approved : user.approved,
        token:token
      }
    }
    );
  }catch(error){
    res.status(500).send({
      status:"500",
      message:error,
      data:null
    });
  }
});

// register 
router.post('/register', async function(req, res, next) {
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


module.exports = router;
