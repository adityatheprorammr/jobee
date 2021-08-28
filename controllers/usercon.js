const User=require('../models/user');
const Job=require('../models/jobs')
const catchAsync=require('../middlewares/catchAsyncErrors');
const { count } = require('../models/user');
const sendToken = require('../utils/jwtToken');
const fs=require('fs');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFilters=require('../utils/apiFilters');
exports.getUserProfile=catchAsync(async(req,res,next)=>{
    const user=await User.findById(req.user.id)
    .populate({
        path:'jobsPublished',
        select:'title postingDate'
    })
    res.status(200).json({
        success:true,
        data:user
    })
})


exports.updatePassword=catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')

    const ismatched=await user.comparePassword(req.body.currentPassword);
    if(!ismatched){
        return next(new Error("password is incorrect"))
    }
    user.password=req.body.newPassword
    await user.save();
    sendToken(user,200,res)
})


exports.updateUser=catchAsync(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email
    }
    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success:true,
        data:user
    })
})

exports.getAppliedJobs=catchAsync(async(req,res,next)=>{
    const jobs=await Job.find({'applicantsApplied.id':req.user.id}).select("+applicantsApplied")
res.status(200).json({
    success:true,
    results:jobs.length,
    data:jobs
})
})

exports.getPublishedJobs=catchAsync(async(req,res,next)=>{
    const jobs=await Job.find({user:req.user.id})
    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    })
})


exports.deleteUser=catchAsync(async(req,res,next)=>{

    deleteUserDate(req.user.id,req.user.role);
    const user=await User.findByIdAndDelete(req.user.id)
    res.cookie('token','none',{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:'your account has been deleted'
    })
})

exports.getUsers=async(req,res,next)=>{
   const apiFilters=new APIFilters(User.find(),req.query)
   .filter()
   .sort()
   .limitFields()
   .pagination()
   const users=await apiFilters.query;

   res.status(200).json({
       success:true,
       results:users.length,
       data:users
   })
}


exports.deleteUseradmin=catchAsync(async(req,res,next)=>{
    const user=await User.findById(req.params.id)
    if(!user){
        return next(new Error(`user not found with id ${req.params.id}`)) 
    }
    deleteUserDate(user.id,user.role);
    user.remove()
    res.status(200).json({
        success:true,
        message:'User is deleted by admin'
    })
})


async function deleteUserDate(user,role){
    if(role === 'employeer'){
        await Job.deleteMany({user:user});
    }
    if(role==='user'){
        const appliedJobs=await Job.find({'applicantsApplied.id':user}).select('+applicantsApplied');
        for(let i=0;i<appliedJobs.length;i++){
            let obj=appliedJobs[i].applicantsApplied.find(o=>o.id===user);

            let filepath=`${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers','');

            fs.unlink(filepath,err=>{
                if(err)return console.log(err);
            })
            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

            appliedJobs[i].save()
        }
    }
}