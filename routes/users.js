import express from 'express';
var router = express.Router();

// const admincontroll = require('../controller/admincontroll');
// const apicontroller = require('../controller/apicontroller');
// const authenticateHeader = require('../middlewares/checkHeaderKeys').authenticateHeader

import AuthController from "../controller/AuthController.js";
import ProfileController from '../controller/ProfileController.js';
import ContactInstructorController from '../controller/ContactInstructorController.js';
import ChatController from '../controller/ChatController.js';
import StripeController from '../controller/StripeController.js';
import SubcriptionController from '../controller/SubcriptionController.js';
import sportscontroll from '../controller/sportscontroll.js';
import Auth from '../middlewares/Auth.js';




/* GET users listing. */
router.get('/', function(req, res, next){
  res.send('respond with a resource');
});
//=================cms=====================//
// router.get('/encryptionForSkPk',apicontroller.encryptionForSkPk)

//===============AUTH ROUTES=================//
router.post("/usersignup",AuthController.userSignup);
router.post("/userlogin",AuthController.userLogin);
router.post("/forgetpassword",AuthController.forgetPassword);
router.post("/resetpassword",AuthController.resetPassword);
router.get("/getuserEmail",AuthController.getuserEmail);
router.get("/getuserPhone",AuthController.getuserPhone);
router.get("/getuserCard",AuthController.getUserCard);
router.post("/userlogout", Auth.Authenticate, AuthController.userLogout);

//===============UPDATE PROFILE ROUTES=================//
router.post("/updateprofile", Auth.Authenticate, ProfileController.updateProfile);
router.post("/updatepassword", Auth.Authenticate, ProfileController.updatePassword);
router.get("/passwordcompare",  ProfileController.passwordCompare);
router.post("/addcarddetails", Auth.Authenticate, ProfileController.cardDetails);
router.post("/addstripekey", Auth.Authenticate, ProfileController.addStripeDetail);
router.post("/deletecard", Auth.Authenticate, ProfileController.dltCard);
router.post("/updateinstructorprofile", Auth.Authenticate, ProfileController.updateInsructorProfile);
router.post("/updatesport", Auth.Authenticate, ProfileController.updateSport);
router.post("/addlesson", Auth.Authenticate, ProfileController.addLesson);
router.post("/addsport", Auth.Authenticate, ProfileController.addSport);
router.post("/dltsport", Auth.Authenticate, ProfileController.dltSport);
router.post("/dltlesson", Auth.Authenticate, ProfileController.dltLesson);
router.post("/photoupdate", Auth.Authenticate, ProfileController.updateProfilePhoto);
router.post("/createrate", Auth.Authenticate, ProfileController.createRate);
router.post("/editsport", Auth.Authenticate, ProfileController.updatePackage);
router.post("/switch-profile", Auth.Authenticate, ProfileController.switchProfile);



//===============CONTACT INSTRUCTOR ROUTES=================//
router.post("/createquery", Auth.Authenticate, ContactInstructorController.createQuery);


//===============CHAT ROUTES=================//
router.post("/createreport", Auth.Authenticate, ChatController.createReport);
router.post("/deletechat", Auth.Authenticate, ChatController.deleteChat);
router.post("/blockuser", Auth.Authenticate, ChatController.BlockUser);
router.post("/read-msg", Auth.Authenticate, ChatController.readMsg);




//===============PAYMENT ROUTES=================//
router.post("/createpayment", Auth.Authenticate, StripeController.createPayment);
// router.post("/paymentIntent",  StripeController.stripeCharge);




//===============SUBSCRIPTION ROUTES=================//
router.post("/createsubscription", Auth.Authenticate, SubcriptionController.createSubscription);
router.post("/instSubscription", Auth.Authenticate, SubcriptionController.createInstSubscription);





//===============SHOP ROUTES=================//
// router.post("/addbulksport", Auth.Authenticate, sportscontroll.addSport);




















// router.get("/aboutus",apicontroller.aboutus)
// router.get("/termsconditions",apicontroller.termscondition)
// router.get("/privacypolicy",apicontroller.privacypolicy)
// //=================admin===================//
// router.post("/login",authenticateHeader,apicontroller.Login)
// router.post("/signup",apicontroller.signup)
// router.post("/forgotpassword",apicontroller.forgot_password)
// router.get("/forgot_url/:hash",apicontroller.forgotUrl)
// router.post('/changePassword', authenticateHeader,apicontroller.changePassword);
// router.get('/logout', apicontroller.logout);
// router.get('/profile',authenticateHeader,apicontroller.profile);
// router.post('/editProfile',authenticateHeader,apicontroller.editProfile);
// router.post('/otpVerify', apicontroller.otpVerify);
// //=================contact us==================//
// router.post('/contactus',authenticateHeader,apicontroller.contactus)
// //==================shop list===========================//
// router.post('/shoplist', authenticateHeader, apicontroller.shoplisting)
// router.post("/sportlist",authenticateHeader,apicontroller.sportlist)
// router.post("/addshop",authenticateHeader,apicontroller.addshop)
// router.post("/addgame",authenticateHeader,apicontroller.addgame)
// router.post('/editgame',authenticateHeader,apicontroller.editgame);
// router.post("/editshop",authenticateHeader,apicontroller.editshop)
export const usersRouter = router;

