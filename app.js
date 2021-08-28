const express=require("express");

const app=express();

const dotenv=require('dotenv');

const cookieparser=require('cookie-parser');

const fileUpload=require('express-fileupload')

const connectdatabase=require('./config/database');

const errorMiddleware=require('./middlewares/errors')

const rateLimit=require('express-rate-limit')

const helmet=require('helmet')

const mongoSanitize=require('express-mongo-sanitize')

const xssClean=require('xss-clean')

const hpp=require('hpp')

const cors =require('cors')

dotenv.config({path:'./config/config.env'})
const PORT=process.env.PORT;
const server=app.listen(PORT,()=>{
console.log(`server started on port ${process.env.PORT}`);
});

process.on('uncaughtException',err=>{
    console.log(`error:${err.message}`)
    console.log('shtting down the server uncaughtException')
    server.close(()=>{
        process.exit(1);
    })
});
process.on('unhandledRejection',err=>{
    console.log(`error:${err.stack}`)
    console.log('shtting down the server')
    server.close(()=>{
        process.exit(1);
    })
})
connectdatabase();






app.use(express.json())

app.use(cookieparser())

app.use(fileUpload())

app.use(mongoSanitize())

app.use(helmet())

app.use(xssClean())

app.use(cors())

app.use(hpp({
    whitelist:['positions']
}))

const limiter=rateLimit({
    windowMs:10*60*1000,//10 min
    max : 100
})

app.use(limiter);

const jobs=require('./routes/jobs');
const auth=require('./routes/auth');
const user=require('./routes/userroutes');



        
    
app.use('/api/v1',user);
app.use('/api/v1',jobs);
app.use('/api/v1',auth);


app.all('*',(req,res,next)=>{
    next(new Error(`${req.originalUrl} route not found`,404))
})


app.use((req,res,next)=>{
    const err=new Error('not found')
    err.status=404
    next(err)
})
app.use((err,req,res,next)=>{
    
    res.status(err.statusCode||400);
    
    res.send({
        
        error:{
            
            status:err.status||400,
          
            message:err.message
        }
    })
    
    
})




