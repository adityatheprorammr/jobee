const mongoose=require("mongoose");
const validator=require('validator');
const slugify=require('slugify');
const geoCoder=require('../utils/geocoder')
const jobSchemea=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'please enter job title'],
        trim:true,
        maxlength:[100]
    },
    slug:String,
    description:{
        type:String,
        required:[true],
        maxlength:[1000]
    },
    email:{
        type:String,
        validate:[validator.isEmail]
    },
    address:{
        type:String,
        required:[true]
    },
    location:{
     type:{
         type:String,
         enum:['Point']
     },
     coordinates:{
         type:[Number],
         index:'2dsphere'
     },
     formattedAddress:String,
     city:String,
     state:String,
     zipcode:String,
     country:String
    },
    company:{
        type:String,
        required:[true]
    },
    industry:{
        type:String,
        required:[true,'please enter job industry'],
        enum:{
            values:[
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'telecommunication',
                'others'
            ],
            message:"please select job"
        }
    },
    jobType:{
     type:String,
     required:true,
     enum:{
         values:[
             'Permanent',
             'Temporary',
             'Internship'
         ],
         message:'please select job'
     }
    },
    minEducation:{
        type:String,
        required:true,
        enum:{
            values:[
                'Bachelors',
                'Masters',
                'phd'
            ],
            message:'please select Education'
        }
    },
    positions:{
        type:Number,
        default : 1
    },
    experience:{
       type:String,
       required:true,
       enum:{
           values:[
               'No Experience',
               '1 Year - 2 Years',
               '2 Year - 5 Years',
               '5 Years+'
           ],
           message:"please select experience"
       } 
    },
    salary:{
        type:Number,
        required:[true]
    },
    postingDate:{
        type:Date,
        default:Date.now
    },
    lastDate:{
        type:Date,
        default:new Date().setDate(new Date().getDate()+7)
    },
    applicantsApplied:{
        type:[Object],
        select:false
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }

});

jobSchemea.pre('save',function(next){
     this.slug=slugify(this.title,{lower:true});
     next();
})

jobSchemea.pre('save',async function(next){
const loc=await geoCoder.geocode(this.address);
this.location={
    type:'Point',
    coordinates:[loc[0].longitude,loc[0].latitude],
    formattedAddress:loc[0].formattedAddress,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode
}
next()
})

module.exports=mongoose.model('Job',jobSchemea);