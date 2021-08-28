const mongoose=require('mongoose')
const connectdatabase=()=>{mongoose.connect(process.env.DB_LOCAL_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    
}).then(con=>{
    console.log("database is connented")
})
};
module.exports=connectdatabase;