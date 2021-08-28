const express=require('express');
const router=express.Router();
const {registerUser,loginUser,forgotpassword,restPassword, logout}=require('../controllers/authcon');
const {isAutheduser}=require('../middlewares/authmiddle')
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotpassword);
router.route('/password/reset/:token').put(restPassword);
router.route('/logout').get(isAutheduser,logout);
module.exports=router;