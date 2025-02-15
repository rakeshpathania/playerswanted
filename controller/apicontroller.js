const db = require("../models")
const { Validator } = require('node-input-validator');
const { Op, where } = require("sequelize");
const sequelize = require("sequelize");
const session = require('express-session');
const bcrypt = require("bcrypt");
const flash = require('express-flash');
const path = require('path')
const helper = require('../helper/helpers-old')
var crypto = require('crypto')
const users = db.users
const nodemailer = require('nodemailer');
const { user_Detail, success } = require("../helper/helpers-old");
const { request } = require("http");
var moment = require('moment');
const { log } = require("console");
const contactus = db.contactus
const uuid = require('uuid').v4;
const image = db.image
const constants = require('../config/constants')
var aes256 = require('aes256');
var sports = db. sports
module.exports = {

    encryptionForSkPk: async (req, res) => {
        try {
            const required = {
                secret_key: req.headers.secret_key,
                publish_key: req.headers.publish_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            if ((req.headers.secret_key !== global.secret_key) || (req.headers.publish_key !== global.publish_key)) {
                return helper.failed(res, 'Key not matched!')
            }
            let sk_data = global.secret_key;
            let pk_data = global.publish_key;
            //encrypt key
            let cipher = aes256.createCipher(global.encryption_key);
            //encrypt buffer
            let encryptedSkBuffer = cipher.encrypt(sk_data);
            let encryptedPkBuffer = cipher.encrypt(pk_data);
            //decrypt data
            let decryptedSkBuffer = cipher.decrypt(encryptedSkBuffer);
            encryptedSkBuffer = 'sk_' + encryptedSkBuffer
            // decryptedSkBuffer = decryptedSkBuffer.toString('utf8')
            let decryptedPkBuffer = cipher.decrypt(encryptedPkBuffer);
            encryptedPkBuffer = 'pk_' + encryptedPkBuffer
            // decryptedPkBuffer = decryptedPkBuffer.toString('utf8')
            return helper.success(res, 'data', { encryptedSkBuffer, encryptedPkBuffer, decryptedSkBuffer, decryptedPkBuffer })
        } catch (err) {
            console.log(err, '------err--------');
        }
    },
    //===============about us========//
    aboutus: async (req, res) => {
        try {
            const cmsdata = await db.cms.findOne({
                where: {
                    id: 3
                }
            })
            return helper.success(res, "About us get successfully", cmsdata)
        } catch (error) {
            console.log('------error', error)
        }
    },
    // ======================termscondition=========//
    termscondition: async (req, res) => {
        try {
            const cmsdata = await db.cms.findOne({
                where: {
                    id: 1
                }
            })
            return helper.success(res, "Terms & condition get successfully", cmsdata)
        } catch (error) {
            console.log('------error', error)
        }
    },
    // ==============privacypolicy================//
    privacypolicy: async (req, res) => {
        try {
            const cmsdata = await db.cms.findOne({
                where: {
                    id: 2
                }
            })
            return helper.success(res, "Privacy policy get successfully", cmsdata)
        } catch (error) {
            console.log('------error', error)
        }
    },
    //====================login===============//
    Login: async function (req, res) {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password,
            };
            const non_required = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };
            let requestdata = await helper.vaildObject(required, non_required, res);
            var password = crypto.createHash('sha1').update(requestdata.password).digest('hex');
            const user_data = await users.findOne({
                where: {
                    email: requestdata.email,
                    password: password
                },
                raw: true
            });
            console.log(user_data, 'user_data===========')
            if (user_data != null) {
                if (user_data.otp_verified == 0) {
                    msg = 'Your account is not otp verified, please verify account first!!';
                    return res.status(200).json({
                        'success': false,
                        'code': 200,
                        'message': msg,
                        'body': user_data,
                    });
                } else {
                    var auth_create = await crypto.randomBytes(20).toString('hex');
                    const update_details = await users.update({
                        auth_key: auth_create,
                        deviceType: requestdata.deviceType,
                        deviceToken: requestdata.deviceToken
                    }, {
                        where: {
                            id: user_data.id,
                        }
                    });
                    user_data.auth_key = auth_create
                    console.log("===================", update_details)
                    msg = 'User Logged In successfully';
                    console.log("login data",);
                    return helper.success(res, msg, user_data);
                }
            } else {
                msg = 'incorrect email or password';
                return helper.failed(res, msg,);
            }
        } catch (error) {
            console.log(error)
            return helper.error(res, error)
        }
    },
    //====================signup==================//
    signup: async function (req, res) {
        try {
            
            console.log(req.body);
            const required = {

                username:req.body.username,
                age: req.body.age,
                gender:req.body.gender,
                latitude:req.body.latitude,
                longitude:req.body.longitude,
                email: req.body.email,
                password: req.body.password,
                phone_number: req.body.phone_number,
                country_code: req.body.country_code,
                image: req.files && req.files.image
            };
            const non_required = {
               
                deviceType: req.body.deviceType, // 1-ios 2=android //
                deviceToken: req.body.deviceToken,
                lat: req.body.lat,
                lng: req.body.lng,
            };
            let requestdata = await helper.vaildObject(required, non_required, res);

            return res.send({requestdata})

            const find_exist_user = await users.findOne({
                where: {
                    email: requestdata.email

                }
            });
            
            if (find_exist_user) {
               return res.json(helper.failed("this email is already exist"))
            }


      
            const find_exist_phone = await users.findOne({
                where: {
                    phone_number: requestdata.phone_number

                }
            });
            if (find_exist_phone) {
                return res.json(helper.failed("this phone number is already exist"))
            }

            requestdata.image = await helper.files_upload(requestdata.image, "")
            requestdata.password = await helper.getBcryptHash(requestdata.password);
            var auth_create = crypto.randomBytes(20).toString('hex');
            
            // console.log(auth_create,'===============auth key');
            // return

            requestdata.auth_key = auth_create
            
            let createuser = await db.users.create(requestdata);

            // return res.send({createuser})

            // var get_user = await db.users.findOne({
            //     where: {
            //         id: createuser.id
            //     }
            // })

            if (createuser) {
                let generate_otp = Math.floor(1000 + Math.random() * 9000);
                createuser.otp = 1111
                await createuser.save();
                // return res.send(await helper.send_emails(1111, createuser.email, ""))
            }

            return res.json(helper.true_status(get_user,"Sign Up Successfully"))

        } catch (error) {
            console.log(error,"=============>");
            return helper.error(res, error)



        }
    },
    // ===============forgotpassword=======//
    forgotpassword: async function (req, res) {
        try {
            const user = await db.user.findOne({
                where: {
                    email: req.body.email,
                },
            });
            let getUrl = `${req.protocol}://${req.get(
                "host"
            )}/forgotpassword`;
            var smtpTransport = nodemailer.createTransport(
                { host: "smtp.gmail.com", port: 587, secure: false },
                {
                    service: "Gmail",
                    auth: {
                        user: "smtptestcqlsys@gmail.com",
                        pass: "smtptestcqlsys@1234",
                    },
                }
            );
            var mail = {
                from: `smtptestcqlsys@gmail.com`,
                to: req.body.email,
                subject: "School Savvy Forget Password",
                html: `<a href="${getUrl}"> Link </a>`,
            };
            let info = await smtpTransport.sendMail(mail);
            return helper.success(res, "email send ");
        } catch (err) {
            return helper.error(res, err)
        }
    },
    //=====================resetpassword============//
    forgot_password: async (req, res) => {
        try {
            const required = {
                email: req.body.email
            };
            const non_required = {
            };
            let requestdata = await helper.vaildObject(required, non_required);
            let existingUser = await user.findOne({
                where: {
                    email: requestdata.email,
                },
                raw: true
            });
            if (!existingUser) throw "Email does not exist.";
            existingUser.forgotPasswordHash = helper.createSHA1();
            let html = `Click here to change your password <a href="${req.protocol
                }://${req.get("host")}/api/forgot_url/${existingUser.forgotPasswordHash
                }"> Click</a>`;
            var smtpTransport = nodemailer.createTransport(
                { host: "smtp.gmail.com", port: 587, secure: false },
                {
                    service: "Gmail",
                    auth: {
                        user: 'smtptestcqlsys@gmail.com',
                        pass: 'smtptestcqlsys@1234'
                    },
                }
            );
            var mail = {
                from: `"halloween" smtptestcqlsys@gmail.com`,
                to: requestdata.email,
                subject: "Send Email Using Node.js",
                text: "Forgot Password",
                html: html,
            };
            let info = await smtpTransport.sendMail(mail);
            const user_email = await helper.save(user, existingUser, true);
            return helper.success(
                res,
                "Forgot Password email sent successfully.",
                {}
            );
        } catch (err) {
            return helper.error(res, err);
        }
    },
    forgotUrl: async (req, res) => {
        try {
            console.log("99999999999999999999999999999999999",req.params.hash);
            let user_detail = await user.findOne({
                where: {
                    forgotPasswordHash: req.params.hash
                }
            });
            if (user_detail) {
                res.render("reset_password", {
                    title: "halloween",
                    response: user_detail,
                    hash: req.params.hash
                });
            } else {
                const html = `
                <br/>
                <br/>
                <br/>
                <div style="font-size: 50px;" >
                    <b><center>Link has been expired!</center><p>
                </div>
              `;
                res.status(403).send(html);
            }
        } catch (err) {
            throw err;
        }
    },

    changePassword: async function (req, res) {
        try {
            const required = {
                auth_key: req.headers.auth_key,
                oldpassword: req.body.oldpassword,
                newpassword: req.body.newpassword,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            let userdetail = await helper.user_detail(requestdata.auth_key)
            console.log("=========", userdetail);
            if (userdetail == null) throw'Invalid authorization key';
            const password = crypto.createHash('sha1').update(requestdata.oldpassword).digest('hex');
            if (password !== userdetail.password) throw 'Old password not match';
            console.log("=======", password
            );
            const newpassword = crypto.createHash('sha1').update(requestdata.newpassword).digest('hex');
            if (password == newpassword) throw 'Old password and new password cannot be same';
            var update_password = await users.update({
                password: newpassword,
            },
                {
                    where: {
                        id: userdetail.id
                    }
                });
            let msg = 'Password Changed Successfully';
            helper.true_status(res, update_password, msg);
        } catch (errr) {
            return helper.error(res, errr)
        }
    },
    // ================logout==============//
    logout: async function (req, res) {
        try {
            const required = {
                auth_key: req.headers.auth_key,
            };
            const non_required = {
            };
            let requestdata = await helper.vaildObject(required, non_required, res);
            let user_detail = await helper.user_detail(requestdata.auth_key)
            if (user_detail == null) throw 'Invalid authorization key'
            const user_detail1 = await db.users.update(
                {
                    auth_key: "",
                    deviceToken: ""
                },
                {
                    where: {
                        id: user_detail.id,
                    }
                }
            );
            let msg = 'Logout successfully';
            const data = {};
            helper.true_status(res, data, msg);
        } catch (error) {
            console.log(error, "=========eror")
            return helper.error(res, error)
        }
    },
    //=========profile=========//
    profile: async function (req, res) {
        const required = { auth_key: req.headers.auth_key };
        const non_required = {};
        let requestdata = await helper.vaildObject(required, non_required, res);
        var user_data = await helper.user_detail(requestdata.auth_key)
        console.log(user_data, "=================userdata");
        if (user_data != null) {
            var user_Detail = await users.findOne({
                where: {
                    id: user_data.id,
                },

            });
            console.log(user_Detail, "==========================userdetail");
            let msg = 'Profile get successfully';
            return helper.true_status(res, user_Detail, msg)
        } else {
            let msg = 'Invalid authorization key';
            return helper.invalid_status(res, msg)
        }
    },
    //=================editProfile==========//
    editProfile: async function (req, res) {
        try {
            const required = {
                auth_key: req.headers.auth_key,
                name: req.body.name,
                phoneno: req.body.phoneno,
                countrycode: req.body.countrycode,
                email: req.body.email,
                passion: req.body.passion,
                hobby: req.body.hobby
            };
            const non_required = {
                image: req.files && req.files.image,
            };
            let requestdata = await helper.vaildObject(required, non_required, res);
            console.log("77777777777777777777777", requestdata);
            let userdata = await helper.user_detail(requestdata.auth_key)
            if (userdata) {
                let deleteimage = await image.destroy({
                    where: {
                        userid: userdata.id
                    }
                });
                const checkEmail = await users.findOne({
                    where: {
                        email: requestdata.email,
                        id: { [Op.ne]: userdata.id }
                    },
                });
                if (checkEmail) {
                    let msg = 'Email already exists';
                    helper.wrong_status(res, msg);
                }
                if (Array.isArray(req.files.image)) {
                    console.log("its array");
                    let getImageArray = [];
                    for (var i in req.files.image) {
                        var extension = path.extname(req.files.image[i].name);
                        var fileImage = uuid() + extension;
                        req.files.image[i].mv(process.cwd() + '/public/images/user' + fileImage, function (err) {
                            if (err)
                                console.log(err);
                        });
                        var data = {
                            image: fileImage,
                            userid: userdata.id
                        }
                        getImageArray.push(data);
                    }
                    const updateimages = await db.image.bulkCreate(getImageArray);
                }
                else {
                    var extension = path.extname(req.files.image.name);
                    var fileImage = uuid() + extension;
                    req.files.image.mv(process.cwd() + '/public/images/user' + fileImage, function (err) {
                        if (err)
                            console.log(err);
                    });
                    const image = await db.image.create({
                        passion: req.body.passion,
                        hobby: req.body.hobby,
                        image: fileImage,
                        userid: userdata.id
                    })
                }
                const user_data = await users.update({
                    name: requestdata.name,
                    email: requestdata.email,
                    phoneno: requestdata.phoneno,
                    country_code: requestdata.country_code,

                },
                    {
                        where:
                            { id: userdata.id }
                    });
                const hobbyUpdate = await hobby.update({
                    hobbyid: req.body.hobby

                },
                    {
                        where:
                            { userid: userdata.id }
                    });
                var userDetail = await users.findOne({
                    attributes: [`id`, `status`, `name`, `phoneno`, `image`, `countrycode`, `email`, `password`, `createdAt`, `updatedAt`, `deviceType`, `deviceToken`, `auth_key`, `otp`, `otp_verified`,
                    ],
                    where: {
                        id: userdata.id,
                    },
                });
                let msg = 'Profile updated successfully';
                helper.true_status(res, userDetail, msg)
            }
            else {
                let msg = 'Invalid authorization key';
                helper.invalid_status(res, msg)
            }
        } catch (error) {
            console.log(error)
            return helper.error(res, error,)
        }
    },
    //================otpverify=========//
    otpVerify: async function (req, res) {
        try {
            const required = {
                otp: req.body.otp,
                email: req.body.email,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            const check_auth = await users.findOne({
                where: {
                    email: requestdata.email,
                    otp: requestdata.otp,
                }
            });
            if (check_auth) {
                var auth_create = crypto.randomBytes(20).toString('hex');
                const detail_data = await users.update({
                    otp_verified: 1,
                    otp: 0,
                    auth_key: auth_create
                },
                    {
                        where:
                        {
                            id: check_auth.id,
                        }
                    });
                const userDetail = await users.findOne({
                    attributes: [`id`, `type`, `name`, `phoneno`, `countrycode`, `email`, `password`, `createdAt`, `updatedAt`, `deviceType`, `deviceToken`, `auth_key`, `otp`, `otp_verified`,
                        [sequelize.literal(`(SELECT case when count(id)=0 then 0 else 1 end as countss FROM childs WHERE userid= user.id)`)],
                    ],
                    where: {
                        id: check_auth.id,
                    }
                });
                let msg = 'Otp verified successfully';
                return helper.true_status(res, userDetail, msg)
            }
            else {
                let msg = 'otp mismatch';
                return helper.invalid_status(res, msg)
            }
        }
        catch (errr) { 
            return helper.error(res, errr);
        }
    },
    //===============contact us=================//
   
    contactus: async function (req, res) {
        try {
            const required = {
            };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let get_all_faq = await contactus.findAll({
                where: {
                    type: 1
                },
                raw: true,
                order: [
                    ['id', 'asc']
                ],
            })
            return helper.success(res, "Faq", get_all_faq);
        } catch (err) {
            return helper.error(res, err);
        }
    },
    shoplisting: async (req, res) => {
        try {
            console.log("====", req.params);
            const required = {
                auth_key: req.headers.auth_key,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            var userdata = await db.shop.findAll({
             
            })
            return helper.success(res, "shop list get successfully", userdata)
        } catch (error) {
            return helper.error(res, error)
        }
    },
  sportlist:async (req,res)=>{
    try {
        const required={
            auth_key:req.headers.auth_key
        };
        const non_required={}
        let requestdata = await helper.vaildObject(required,non_required,res)
        var sportdata =await sports.findAll({
            attributes: {
                include: [[sequelize.literal('(SELECT username FROM users WHERE sports. user_id  = users.id )'), 'UserName'],
                [sequelize.literal('(SELECT name FROM game WHERE sports. game_id  = game.id )'), 'GAMEName'],
                // [sequelize.literal('(SELECT name FROM events WHERE transactions. type_id  = events.id )'), 'EventName'],
                ],
            }

        })
        return helper.success(res,"sports list get successfully",sportdata)
    } catch (error) {
        return helper.error(res,error)
    }
  },
  addshop:async(req,res)=>{
    try {
        const required={
         name:req.body .name,
         description:req.body.description,
         price:req.body .price,
         image:req.files&& req.files.image
        }
        const non_required={}
        let requestdata = await helper.vaildObject(required,non_required,res) 
        let image = requestdata.image;
        if (requestdata.image) {
            image = await helper.fileUpload(requestdata.image, "");
        }
        var addshop = await db.shop.create({
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            image:req.files.image,
        })
        return helper.success (res,"add shop successfully ",addshop) 
    } catch (error) {
        return helper.error(res,error)
    }
  },
 addgame:async(req,res)=>{
    try {
        const required={
            name:req.body.name
        }
        const non_required={}
  let requestdata=await helper.vaildObject(required,non_required,res)
  var addgame=await db.game .create({
    name:req.body.name,
  })
  return helper.success(res,"add game successfully",addgame)

    } catch (error) {
        return helper.error(res,error)

    }
 },
 editgame:async(req,res)=>{
    try {
        const required={
        game_id:req.body.game_id,
        name:req.body.name

        }
        const non_required={}
        let requestdata =await helper.vaildObject(required,non_required,res)

        var editgame =await db.game.update({
            name:req.body.name,},{
                where: {
                    id: requestdata.game_id
                }
        })
        return helper.success(res,"game edit succeesfully ",editgame)
    } catch (error) {
        return helper.error(res,error)

    }
 },
 editshop:async(req,res)=>{
    try {
        const required={
            shop_id:req.body.shop_id,
            name:req.body .name,
            description:req.body.description,
            price:req.body .price,
            // image:req.files&& req.files.image
        };
        const non_required={}
        let requestdata =await helper.vaildObject(required,non_required,res)
        // if (requestdata.image) {
        //     image = await helper.fileUpload(requestdata.image, "user");
        //     console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyy", image);
        // }
        var editshop =await db.shop.update({
                name:req.body.name,
                description:req.body.description,
                price:req.body .price,
               },{
                    where: {
                        id: requestdata.shop_id

                    }

                })
        return helper.success(res,"edit shop successfully ",editshop)
    } catch (error) {
        return helper .error(res,error)
    }
 },
 signup:async(res,req)=>{
    try {
        const required={
   username:req.body.username,
   email:req.body.email,
    password:req.body.password,
  gender:req.body.gender,
age:req.body.age

        } 
    } catch (error) {
        
    }
   
 }


    }





