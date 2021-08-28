const sendToken=(user,statusCode,res,req)=>{
    const token=user.getJwtToken()
    const options={
        exports:new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME*24*60*60*1000),
        httpOnly:true

    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}
module.exports=sendToken