const express = require('express');
const router=express.Router();
const {getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs,getPublishedJobs, getUsers,deleteUseradmin}=require('../controllers/usercon')

const {isAutheduser, authroles}=require('../middlewares/authmiddle')

router.route('/jobs/applied').get(isAutheduser,getAppliedJobs)

router.route('/jobs/published').get(isAutheduser,authroles('employeer','admin'),getPublishedJobs)

router.route('/me').get(isAutheduser,getUserProfile)

router.route('/password/change').put(isAutheduser,updatePassword)

router.route('/me/update').put(isAutheduser,updateUser)

router.route('/me/delete').delete(isAutheduser,deleteUser)

router.route('/users').get(isAutheduser,authroles('admin'),getUsers)

router.route('/user/:id').delete(isAutheduser,authroles('admin'),deleteUseradmin)
module.exports=router;