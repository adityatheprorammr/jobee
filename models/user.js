const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const crypto=require('crypto')
const jwt=require('jsonwebtoken');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your name ']
    },
    email:{
        type:String,
        required:[true,'please enter your email address'],
        unique:true,
        validate:[validator.isEmail,'please enter valid email address']
    },
    role:{
        type:String,
        enum:{
            values:['user','employeer','admin'],
            message:'please select correct role'
        },

    default:'user'
    },
    password:{
        type:String,
        required:true,
        minlength:[8, 'your password must be at least 8 characters long'],
        select:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
},{
toJSON:{virtuals:true},
toObject:{virtuals:true}
})


userSchema.pre('save',async function(next){

if(!this.isModified('password')){
    next();
}

    this.password=await bcrypt.hash(this.password,10)
})


userSchema.methods.getJwtToken=function(){
   return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}
userSchema.methods.getRestPasswordToken=function(){
    const resetToken=crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex')

    this.resetPasswordExpire=Date.now()+30*60*1000;
    console.log(resetToken)
    return resetToken
}

userSchema.methods.comparePassword=async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password)
}

userSchema.virtual('jobsPublished', {
    ref : 'Job',
    localField : '_id',
    foreignField : 'user',
    justOne : false
});
module.exports=mongoose.model('User',userSchema)