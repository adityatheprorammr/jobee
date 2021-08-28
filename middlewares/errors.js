const ErrorHandler=require('../utils/errorHandler')

module.exports=(err,req,res,next)=>{
err.statusCode=err.statusCode||500;


if(process.env.NODE_ENV==='development'){
    res.status(err.statusCode).json({
        success:false,
        error:err,
        errMessage:err.message,
        stack:err.stack
    });
}
if(process.env.NODE_ENV==='production'){
    let error={...err};
    error.message=err.message;
    if(err.name==='validationError'){
        const message=Object.values(err.errors).map(value=>value.message);
        error=new Error(message,400);
    }
res.status(err.statusCode).json({
    success:false,
    message:error.message||'Internal server Error'
});

}

}