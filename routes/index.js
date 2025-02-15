
import express from 'express';

var router = express.Router();
import dashboard from '../controller/dashboard.js';
import admincontroller from '../controller/admincontroll.js';
import usercontroller from '../controller/usercontroller.js';
import cmscontroller from '../controller/cmscontroller.js';
import contactcontroller from '../controller/contactcontroller.js';
import shopcontroller from '../controller/shopcontroller.js';
import sportscontroll from '../controller/sportscontroll.js';
import lessoncontroll from '../controller/lessoncontroll.js';
import gamecontroller from '../controller/gamecontroller.js';
import VideoController from '../controller/VideoController.js'

/* GET home page. */
// ================dashboard==============//
router.get('/dashboard',dashboard.dashboard)
///// admin///////////
router.post('/register', admincontroller.register)

router.get('/get_login', admincontroller.login)
router.post('/in_login', admincontroller.login_in)
router.get('/log_out', admincontroller.log_out)
router.get('/admin_profile', admincontroller.admin_profile)
router.post('/update_profile', admincontroller._profile_post)
router.get('/change_password', admincontroller.change_password)
router.post('/update_password', admincontroller.update_password)

//=====================users============//
router.get('/users', usercontroller.users)
router.get('/view/:id', usercontroller.view)
router.post("/userstatus", usercontroller.userstatus)
router.get('/users', usercontroller.users)
//==========================cms===========//
router.get('/aboutus', cmscontroller.aboutus)
router.post("/aboutus/:id",cmscontroller.updateaboutus)
router.get("/condition",cmscontroller.termscondition)
router.post("/condition/:id",cmscontroller.postTerms)
router.get("/privacypolicy",cmscontroller.privacypolicy)
router.post("/privacypolicy/:id",cmscontroller.updateprivacypolicy)
router.get("/help",cmscontroller.help)
router.post("/help/:id",cmscontroller.updatehelp)
//======================contactus================//
router.get("/listcontact",contactcontroller.listcontact)
router.get('/viewcontact/:id', contactcontroller.view)
router.post("/contactstatus", contactcontroller.contactstatus)
//=============================shop======================//
router.get("/listshop",shopcontroller.listshop)
router.get("/addshop",shopcontroller.shop)
router.post("/addshop",shopcontroller.postshop)
router.get("/editshop/:id",shopcontroller. editshop)
router.post("/editshop/:id",shopcontroller.editpostshop)
router.post("/deletshop/:id",shopcontroller.deleteshop);
router.get('/viewshop/:id', shopcontroller.view)
//========================sports===================//
router.get("/listsports",sportscontroll.listsports)
router.post("/deletsports/:id",sportscontroll.deletesports);
router.get('/viewsports/:id', sportscontroll.viewsports)
//==============================lesson==================//
router.get("/listlesson",lessoncontroll.listlesson)
router.post("/deletlesson/:id",lessoncontroll.deletelesson);
router.get('/viewlesson/:id', lessoncontroll.viewlesson)
router.get("/editlesson/:id",lessoncontroll. editlesson)
//===================game=========================//
router.get("/listgame",gamecontroller.listgame)
router.get("/addgame",gamecontroller.game)
router.post("/addgame",gamecontroller.postgame)
router.get("/editgame/:id",gamecontroller. editgame)
router.post("/editGame/:id",gamecontroller.editpostgame)
router.post("/deletgame",gamecontroller.deletegame);
router.get('/viewgame/:id', gamecontroller.gameview);

//===================video=========================//
router.get('/videolist', VideoController.videoView);
router.get('/addvideo', VideoController.addVideo);
router.get('/viewvideo', VideoController.viewVideo);
router.get('/editvideo', VideoController.editVideo);
router.post('/add-video', VideoController.VideoCreate );
router.post('/update-video/:id', VideoController.VideoUpdate );
router.post('/dlt-video/:id', VideoController.dltVideo );







export const indexRouter = router;
