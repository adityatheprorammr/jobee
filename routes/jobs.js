const express = require("express");
const {getjobs,newJob,getjobsinradius,updateJob,deletejob,getjob,jobstats, applyJob}=require('../controllers/jobscontrollers');
const {isAutheduser,authroles}=require('../middlewares/authmiddle')
const router=express.Router();

router.route('/jobs').get(getjobs)

router.route('/job/:id/:slug').get(getjob)

router.route('/jobs/:zipcode/:distance').get(getjobsinradius)

router.route('/job/new').post(isAutheduser,authroles('employeer','admin'),newJob)


router.route('/job/:id/apply').put(isAutheduser,authroles('user'),applyJob)


router.route('/stats/:topic').get(jobstats)


router.route('/job/:id').put(isAutheduser,authroles('user'),updateJob)

module.exports=router;