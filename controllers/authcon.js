const User=require('../models/user');
const catchAsync=require('../middlewares/catchAsyncErrors');
const sendToken=require('../utils/jwtToken');
const sendEmail=require('../utils/sendEmail')
const crypto=require('crypto');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

exports.registerUser=catchAsync(async(req,res,next)=>{
    
const {name,email,password,role}=req.body;

const user = await User.create({
    name,
    email,
    password,
    role
});
sendToken(user,200,res);
})



exports.loginUser=catchAsync(async(req,res,next)=>{
const {email,password}=req.body;
if(!email||!password){
  return  next(new Error("please enter email and password",401))
}
const user=await User.findOne({email}).select('+password');

if(!user){
 return next(new Error("Invalid  email or password",401))
}

const ispasswordMatch=await user.comparePassword(password);
if(!ispasswordMatch){
    return next(new Error("Invalid  email or password",401))
}

sendToken(user,200,res);

})

exports.forgotpassword=catchAsync(async (req,res,next)=>{
  const user=await User.findOne({email:req.body.email})


  if(!user){
    return next(new Error("No user found"))
  }
  const resetToken=user.getRestPasswordToken();
  
  await user.save({validateBeforeSave:false});

  const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`


  const message=`your password reset link is as follow:\n\n${resetUrl}`
  try {
    await sendEmail({
        email : user.email,
        subject : 'Jobbee-API Password Recovery',
        message
    });

    res.status(200).json({
        success : true,
        message : `Email sent successfully to: ${user.email}`
    });
} catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save({ validateBeforeSave : false });

    return next(new Error('Email is not sent.'), 500);
} 

})

exports.restPassword=catchAsync(async(req,res,next)=>{
  const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  })
  if(!user){
    return next(new Error("password reset token is invalid"))
  }
  user.password=req.body.password;


  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user,200,res)
})

exports.logout=catchAsync(async(req,res,next)=>{
  res.cookie('token','none',{
    expires:new Date(Date.now()),
    httpOnly:true
  })
  res.status(200).json({
    success:true,
    message:'Logged out successfully'
  })
})