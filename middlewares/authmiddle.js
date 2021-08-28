const jwt = require('jsonwebtoken');
const User=require('../models/user');
const catchAsync=require('../middlewares/catchAsyncErrors')
exports.isAutheduser=catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith
    ('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new Error('login first to access this resource'))
    }
    try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id);
    }
    catch(err){
     jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
        if(err){
          return next(new Error('unauthorized'))
        }
        
        req.payload=payload
      });
    }
    next()
})
exports.authroles=(roles)=>{
    return (req,res,next)=>{
      if(!roles.includes(req.user.role)){
        return next(new Error(`Role (${req.user.role}) is not allowed to access this resource`,401))
      }
      next()
    }
    }