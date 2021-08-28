const path = require('path');
const Job=require('../models/jobs');
const geoCoder = require('../utils/geocoder');

const  Mongoose  = require("mongoose");
const catchAsync=require('../middlewares/catchAsyncErrors');
const APIFilters = require('../utils/APIFilters');
exports.getjobs=catchAsync(async(req,res,next)=>{
const apiFilters=new APIFilters(Job.find(),req.query)
.filter()
.sort()
.limitFields()
.searchByQuery()
.pagination()



const jobs=await apiFilters.query;


    res.status(200).json({
        success:true,
        requestMethod:req.requestMethod,
        result:jobs.length,
        message:"this route will display all jobs in future",
        data:jobs
    })
})
exports.newJob=catchAsync(async(req,res,next)=>{
    req.body.user=req.user.id
    const job = await Job.create(req.body);
    res.status(200).json({
        success:true,
        message:'job created',
        data:job
    })
});

exports.updateJob = catchAsync(async (req, res, next) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404).json({
            success: true,
            message: 'Job is not found.',
        
        });
    }

    // Check if the user is owner
    
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error(`User(${req.user.id}) is not allowed to update this job.`))
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Job is updated.',
        data: job
    });
});


exports.getjobsinradius=catchAsync(async(req,res,next)=>{
    const {zipcode,distance}=req.params;


    const loc=await geoCoder.geocode(zipcode);
    const latitude=loc[0].latitude;
    const longitude=loc[0].longitude;
    const radius=distance/3963;
   const jobs= await Job.find({
        location:{$geoWithin:{$centerSphere:[[longitude,latitude],radius]
        }}
    })
    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    })
})


exports.deletejob=catchAsync(async(req,res,next)=>{
    let job= await Job.findById(req.params.id);
    if(!job){
        return res.status(404).json({
            success :false,
            message:'job not found'
        })
    }
   


    job=await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success :true,
        message:'job is deleted'
    })
})


exports.getjob=catchAsync(async(req,res,next)=>{
    const job = await Job.findById(req.params.id).populate({
        path:'user',
        select:'name'
    });
    if(!job){
        return res.status(404).json({
            success :false,
            message:'job not found'
        })
       
    }
   
    
    res.status(200).json({
        success:true,
        data:job
    });
})



exports.jobstats=catchAsync(async(req,res,next)=>{
    const stats=await Job.aggregate([
        {
            $match:{$text:{$search:"\""+req.params.topic+"\""}}

        },
        {   
           
            $group:{
                _id:{$toUpper:'$experience'},
                totalJobs:{$sum:1},
                avgSalary:{$avg:'$salary'},
                minSalary:{$min:'$salary'}
            }
        }
    ])
    if(stats.length===0){
        return res.status(404).json({
            success:false,
            message:`No stats found for -${req.params.topic}`
        })
    }

res.status(200).json({
    success:true,
    data:stats
})
})


exports.applyJob=async(req,res,next)=>{
    let job= await Job.findById(req.params.id).select("+applicantsApplied")
    if(!job){
        return next(new Error('job not found'))
    }

    if(job.lastDate < new Date(Date.now())){
        return next(new Error('you can not apply to this Job'))
    }
for(let i=0; i<job.applicantsApplied.length;i++){
    if(job.applicantsApplied[i].id === req.user.id){
        return next(new Error('you have already applied for this job'))
    }
}
   

    if(!req.files){
        return next(new Error('please upload file'))
    }

const file=req.files.file

const supportFiles=/.docs|.pdf/;
if(!supportFiles.test(path.extname(file.name))){
return next(new Error('please upload document'))
}

if(file.size > process.env.MAX_FILE_SIZE){
    return next(new Error('please upload file less than 2mb'))

}
file.name=`${req.user.name.replace(' ','_')}_${job._id}${path.parse(file.name).ext}`
file.mv(`${process.env.UPLOAD_PATH}/${file.name}`,async err=>{
    if(err){
        console.log(err);
        return next(new Error('please upload file less than 2mb'))
    }
    await Job.findByIdAndUpdate(req.params.id,{$push:{
        applicantsApplied:{
            id:req.user.id,
            resume:file.name
        }
    }},{
    new:true,
    runValidators:true,
    useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        message:'applied to job successful',
        data:file.name
    })
})
}