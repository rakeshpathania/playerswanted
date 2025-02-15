import path from 'path';
import fs from 'fs';

import User from '../models/users.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import apn from 'apn';
import bcrypt from 'bcrypt';  
import { uuid } from 'uuidv4';



export default{
    checkValidation: async (v) => {
        var errorsResponse
        await v.check().then(function (matched) {
            if (!matched) {
                var valdErrors = v.errors;
                var respErrors = [];
                Object.keys(valdErrors).forEach(function (key) {
                    if (valdErrors && valdErrors[key] && valdErrors[key].message) {
                        respErrors.push(valdErrors[key].message);
                    }
                });
                errorsResponse = respErrors.join(', ');
            }
        });
        return errorsResponse;
    },

    fileUpload: (file, folder) => {
        
        if (file.name) {
            let extention = file.mimetype.split("/")[1];
            let image = `${uuid()}.${extention}`;
            let imagePath = `/uploads/${folder}/${image}`;
            
            

            file.mv(process.cwd() + `/public/${folder}/` + image, function (err) {
                if (err)
                    return err;
            });
            return image;
        } else {
            return "";
        }

    },
    imageUpload: (file, folder = 'images') => {
        if (file.name == '') return;
        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");

        var file_extension = file_name_array[file_name_array.length - 1];
        var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
        var result = "";
        // while (result.length<28)
        // {
        //     var rand_int = Math.floor((Math.random() * 19) + 1);
        //     var rand_chr= letters[rand_int];
        //     if (result.substr(-1, 1)!=rand_chr) result+=rand_chr;
        // }
        result = uuid();
        let name = result + '.' + file_extension;
        // console.log(name);return false;
        file.mv('public/' + folder + '/' + name, function (err) {
            0
            if (err)
                return err
        });

        return name;
    },





    // vaildObject: async (required, nonRequired,res) => {
    //     let message = '';
    //     let empty = [];

    //     // let model = required.hasOwnProperty('model') && db.hasOwnProperty(required.model) ? db[required.model] : db.user;

    //     for (let key in required) {
    //         if (required.hasOwnProperty(key)) {
    //             if (required[key] == undefined || required[key] === '' && (required[key] !== '0' || required[key] !== 0)) {
    //                 empty.push(key);
    //             }
    //         }
    //     }if (empty.length != 0) {
    //         message = empty.toStusersring();
    //         if (empty.length > 1) {
    //             message += " fields are required"
    //         } else {
    //            // if(message!="id"){ 
    //                 message += " field is required"
    //             }
    //         //     else{
    //         //         message += " field is required in params"}
    //         // }
    //         throw {
    //             'code': 400,
    //             'message': message,
    //         }



    //     } else {

    //         // if (required.hasOwnProperty('password')) {
    //         //     required.password = await bcrypt.hash(required.password , 15);
    //         //     console.log( required.password ,'password bcrypt entered by user');
    //         // }

    //         const merge_object = Object.assign(required, nonRequired);
    //         delete merge_object.checkexit;
    //         delete merge_object.securitykey;

    //         if (merge_object.hasOwnProperty('password') && merge_object.password == '') {
    //             delete merge_object.password;
    //         }

    //         for (let data in merge_object) {
    //             if (merge_object[data] == undefined) {
    //                 delete merge_object[data];
    //             } else {
    //                 if (typeof merge_object[data] == 'string') {
    //                     merge_object[data] = merge_object[data].trim();
    //                 }
    //             }
    //         }

    //         return merge_object;
    //     }
    // },

    vaildObject: async function (required, non_required, res) {
        let msg = '';
        let empty = [];
        let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';

        for (let key in required) {
            if (required.hasOwnProperty(key)) {
                if (required[key] == undefined || required[key] == '') {
                    empty.push(key)
                        ;
                }
            }
        }

        if (empty.length != 0) {
            msg = empty.toString();
            if (empty.length > 1) {
                msg += " fields are required"
            } else {
                msg += " field is required"
            }
            res.status(400).json({
                'success': false,
                'msg': msg,
                'code': 400,
                'body': {}
            });
            return;
        } else {
            if (required.hasOwnProperty('security_key')) {
                if (required.security_key != "") {
                    msg = "Invalid security key";
                    res.status(403).json({
                        'success': false,
                        'msg': msg,
                        'code': 403,
                        'body': []
                    });
                    res.end();
                    return false;
                }
            }
            if (required.hasOwnProperty('password')) {

            }
            const marge_object = Object.assign(required, non_required);
            delete marge_object.checkexit;

            for (let data in marge_object) {
                if (marge_object[data] == undefined) {
                    delete marge_object[data];
                } else {
                    if (typeof marge_object[data] == 'string') {
                        marge_object[data] = marge_object[data].trim();
                    }
                }
            }

            return marge_object;
        }
    },

    success: function (res, message, body = {}) {
        return res.status(200).json({
            'success': 1,
            'code': 200,
            'message': message,
            'body': body
        });
    },

    error: function (err, body = {}) {
        console.log(err, '===========================>error');

        let code = (typeof err === 'object') ? (err.code) ? err.code : 400 : 400;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        return {
            'success': false,
            'code': code,
            'message': message,
            'body': body
        };
    },

    error401: function (res, err, body = {}) {
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        let code = 401;
        res.status(code).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        });

    },

    makeImageUrlSql: (model, field, modelFolder = 'images', returnField = field, ifEmpty = '') => ([
        sequelize.literal(`(IF (LOCATE('http', \`${model}\`.\`${field}\`) > 0, \`${model}\`.\`${field}\`, IF (\`${model}\`.\`${field}\`='', "${ifEmpty}", CONCAT('${BASE_URL}/assets/${modelFolder}/', \`${model}\`.\`${field}\`)) ))`),
        returnField
    ]),

    InstructorLogo: (image) => (
        ` ${BASE_URL}/assets/images/${image} `

    ),
    send_emails: function (otp, email, resu) {

     
        let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            secure: false,
            auth: {
                user: "0ceed3d9c5ba7d",
                pass: "12053b661b94e9"

            }
        });
        let mailOptions = {
            from: "test978056@gmail.com", // sender address
            to: email, // list of receivers
            subject: 'Test', // Subject line
            text: 'PicMash App: Forgot password', // plain text body
            html: `Hi, ${email} your otp is ${otp} please verify once and reset your password`// html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    },
    sendEmail(object) {
        try {
            console.log("-------------------", object);
            var transporter = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "0ceed3d9c5ba7d",
                    pass: "12053b661b94e9"
                }
            });
            var mailOptions = {
                from: `"Catchme",<${object.to}>`,
                ...object,
            };

            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } catch (err) {
            throw err;
        }
    },
    send_email: async function (get_param, req, res) {

        console.log(get_param, "get_param");
        var data = await User.findOne({
            where: {
                email: get_param.email,
            },
            raw: true,
        });
        /  console.log(data) /
        if (data) {

            var email_password_get = await this.email_password_for_gmail();

            var url_data = await this.url_path(req);

            let auth_data = await this.generate_auth_key();
            await User.update({ resetpassword_token: auth_data }, {
                where: {
                    email: data.email
                }
            })

                / console.log(auth_data, "auth_data");

            var transporter = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "0ceed3d9c5ba7d",
                    pass: "12053b661b94e9"
                }
            });

            var mailOptions = {

                from: email_password_get.email_data,
                to: get_param.email,
                subject: 'Display Forgot Password',
                html: 'Click here for change password <a href="' +
                    url_data +
                    "/api/reset_password/" +
                    auth_data +
                    '"> Click</a>'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            save = await User.update({
                forgotPassword: auth_data,
            }, {
                where: {

                    id: data.id

                }
            });
            507
            return transporter;
        } else {

            let msg = 'Email not registered';
            throw msg
        }

    },
    createSHA1: function () {
        let key = 'abc' + new Date().getTime();
        return crypto.createHash('sha1').update(key).digest('hex');
    },
    bcryptHash: (myPlaintextPassword, saltRounds = 10) => {
        const bcrypt = require('bcrypt');
        const salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(myPlaintextPassword, salt);
        hash = hash.replace('$2b$', '$2y$');
        return hash;
    },

    true_status: function (body, msg) {
        return {
            'success': true,
            'status_code':1,
            'code': 200,
            'message': msg,
            'body': body,
        };

    },


    getBcryptHash: async (keyword) => {
        const saltRounds = 10;
        var myPromise = await new Promise(function (resolve, reject) {
            bcrypt.hash(keyword, saltRounds, function (err, hash) {
                if (!err) {

                    resolve(hash);
                } else {
                    reject('0');
                }
            });
        });
        // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
        keyword = myPromise;
        return keyword;
    },
    user_detail: async function (auth_key) {
        // console.log(auth_key,'-----====-=-=-=-=-=here');return
        let getData = await User.findOne({
            where: {
                auth_key: auth_key
            }
        })
        return getData
    },
    get_user_data: async function (user_id, req, res) {
        get_signup_data = await User.findOne({

            where: {
                id: user_id
            },
            raw: true
        });
        // console.log(">>>>>>>>>>>>>>>>>>>>",get_signup_data);return


        return get_signup_data
    },
    send_push_notification: async (get_message, device_token, device_type, target_id, target_name, noti_type) => {
        console.log(device_type, target_id, noti_type, target_name)

        //  device_type = 2
        //  device_token = 'dI6oMjBNSE-UvNrrNOL5nN:APA91bF_B06of-bdqUpxUzkmAtUXik1Q158bB3cUj4BmFQtZb0L5C7soYKu17IaitYuoa5b3G9HD6c0W0RrzVX3q3pt7-hwVyEbIQJF6ZZ-4fMXAaZB7R_JH76gmjpTzndC42WbYJKvB'
        if (device_type == 2) {
            const apn = require('apn');
            const options = {
                token: {
                    key: path.join(__dirname, "./AuthKey_Q3NW9UXH2J (1).p8"),
                    keyId: "Q3NW9UXH2J",
                    teamId: "4XVQBWH9QF"
                },
                production: false
            };
            const apnProvider = new apn.Provider(options);
            if (device_token && device_token != '') {
                var message = {
                    to: device_token,
                    data: {
                        title: "Catchme",
                        message: get_message,
                        device_token: device_token,
                        device_type: device_type,
                        notification_code: noti_type,
                        sender_id: target_id,
                        sender_name: target_name
                    }

                };
                if (device_token && device_token != '') {
                    var myDevice = device_token;
                    // var myDevice = `2b27f1c2cc7c1cc2519a51f89c2ec51f90a918b7e46cdede84cb46e86fb70fc7`
                    var note = new apn.Notification();
                    let bundleId = "com.trans-it.Trans-it";
                    console.log('=???????????????????', bundleId);

                    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                    // note.badge = save_noti_data.notification_count;
                    note.badge = 0;
                    note.sound = "default";
                    note.title = "Shot Clock";
                    note.body = get_message;
                    note.payload = message;
                    note.topic = bundleId;
                    console.log("send note", note);

                    apnProvider.send(note, myDevice).then((result) => {
                        console.log("send result", result);
                        if (result.sent != '') {
                            console.log("push sent");

                        } else {
                            console.log("error while sending user notificatio");
                        }
                    });
                } else {
                    console.log("push sent not sent empty  device token");
                }
            }
        }

    },
    p8: async (deviceTokens, payload, collapseId) => {
        var options = {
            token: {
                key: path.join(__dirname, "./AuthKey_Q3NW9UXH2J (1).p8"),
                keyId: "Q3NW9UXH2J",
                teamId: "4XVQBWH9QF"
            },
            production: false
        };
        console.log(options, "========")

        var apnProvider = new apn.Provider(options);

        var note = new apn.Notification();

        // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        // note.badge = 3;
        if (payload.status == 4) {
            note.sound = "default";
        } else {
            note.sound = "note.aiff";
        }
        //  note.alert = "You have a video call";

        note.alert = payload.notificationTitle
        // note.payload = {};
        // note.payload = payload
        // note.payload = payload
        note.aps.payload = payload
        // note.topic = "Cqlsys.live.Nauatili.voip";
        note.topic = "com.trans-it.Trans-it";
        note.collapseId = collapseId
        // note.body = {
        //     notification_type: notification_type,
        //     message: message
        // };

        console.log(note);
        // return

        apnProvider.send(note, deviceTokens).then((result) => {
            // see documentation for an explanation of result
            console.log(result);
        });
    },

    failed: function (message = '') {
        message = (typeof message === 'object') ? (message.message ? message.message : '') : message;
        return {
            'success': false,
            'code': 400,
            'message': message,
            'body': {}
        };
    },


    files_upload: async function (image, folderName) {
        if (image) {
            var extension = path.extname(image.name);
            var filename = uuid() + extension;
            var sampleFile = image;
            sampleFile.mv(process.cwd() + `/public/${folderName}/` + filename, (err) => {
                if (err) throw err;
            });

            return filename;
        }

    },


    userDetail: async function (data, userId, type) {

        // console.log(data);

        userDetails_create = await users.create({
            name: data.name,
            deviceType: data.device_type,
            deviceToken: data.device_token,
            userid: userId,
            type: type,
            profileImage: 'default.png',
        });
        return userDetails_create;

    },
}


