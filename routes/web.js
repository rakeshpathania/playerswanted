import express from 'express';
var router = express.Router();

import webcontroller from '../controller/webcontroller.js';
import Auth from '../middlewares/Auth.js';

/* GET users listing. */
router.get('/', function(req, res, next){
  res.send('respond with a resource');
});
//=================cms=====================//
router.get('/index',webcontroller.index)
router.get('/register',webcontroller.register)

// router.post('/signup',webcontroller.signup)
router.get('/about', webcontroller.about)
router.get('/home', webcontroller.home)
router.get('/resetpassword',webcontroller.resetpassword)
router.get('/store',webcontroller.store)
router.get('/myaccount', Auth.Authenticate, webcontroller.myaccount)
router.get('/Sportsoffered',webcontroller.sportsoffered)
router.get('/Sportsofferedtwo',webcontroller.sportsofferedtwo)
router.get('/contactinstructor',webcontroller.contactinstructor)
router.get('/videos',webcontroller.videos)
router.get('/booknow', Auth.Authenticate, webcontroller.booknow)
router.get('/lessons',webcontroller.lessons)
router.get('/buddy', Auth.Authenticate, webcontroller.buddy)
router.get('/detail',Auth.Authenticate, webcontroller.detail)
router.get('/message',Auth.Authenticate, webcontroller.message)
router.get('/terms_of_user',webcontroller.termsofuse)
router.get('/reviews',webcontroller.reviews)
router.get('/rate', Auth.Authenticate, webcontroller.rate)
router.get('/privacy_policy',webcontroller.privacy)
router.get('/payment01',Auth.Authenticate, webcontroller.payment01)
router.get('/payment02',webcontroller.payment02)
router.get('/buddy_map',Auth.Authenticate, webcontroller.buddyMap)
router.get('/inst_profile', Auth.Authenticate, webcontroller.instructorProfile)
router.get('/subsribe', Auth.Authenticate, webcontroller.subscription)
router.get('/getdirection', Auth.Authenticate, webcontroller.getDirection)





export const webRouter = router;
