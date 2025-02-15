const db = require('../models');
const sequelize = require('sequelize');
const crypto = require('crypto');
const fs = require('fs');
var nodemailer = require('nodemailer');
var path = require('path');
var uuid = require('uuid');
var moment = require('moment');
const socket_user = db.socketUser
//console.log(socket_user,"socket_user");
const chatConstants = db.chatConstants
const users = db.users
const user_detail = db.userDetail;
const database = require('../db/db.js');
const messages = db.messages
const chatBlock = db.chatBlock
const chatReport = db.chatReport
const providerLocations = db.providerLocations
const blockedUser = db.blockedUser
const group_users = db.group_users
const callHistory = db.call_history
const group_messages_delete = db.group_messages_delete
const group_chat_report = db.group_chat_report
const groups = db.groups
const Op = sequelize.Op;

//onst FCM = require('fcm-node');
module.exports = {

    create_time_stamp: async function () {

        let current_time = Math.round(new Date().getTime() / 1000)

        return current_time;
    },

    single_image_upload: function (data, folder) {
        let image = data;
        image.mv(process.cwd() + '/public/' + folder + '/' + image.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            }

        });
        return image.name;

    },


    send_push_notification: function (get_message, device_token, device_type, title, data_to_send) {
        if (device_type == 1) {
            const apn = require('apn');
            const options = {
                token: {
                    key: path.join(__dirname, "./AuthKey_76AW9XYDLJ.p8"),
                    keyId: "76AW9XYDLJ",
                    teamId: "UL6P4CWL4N"
                },
                production: false
            };
            const apnProvider = new apn.Provider(options);
            var message = {
                to: device_token,

                data: {
                    body: get_message,
                    sender_id: target_id,
                    sender_name: target_name,
                    noti_type: noti_type
                }
            };
            if (device_token && device_token != '') {
                var myDevice = device_token;
                // var myDevice = `2b27f1c2cc7c1cc2519a51f89c2ec51f90a918b7e46cdede84cb46e86fb70fc7`
                var note = new apn.Notification();
                let bundleId = "com.Speed.inn";
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
        if (device_type == 2) {
            if (device_token && device_token != '') {
                var new_message = {
                    to: device_token,
                    data: {
                        title: "Shot Clock",
                        message: get_message,
                        device_token: device_token,
                        device_type: device_type,
                        notification_code: noti_type,
                        sender_id: target_id,
                        sender_name: target_name
                    }
                };
                var serverKey = 'AAAA4YsbNQQ:APA91bGO1RF5nDZt7Gm2H2k6QwCHaNF1HfNwcoEYKtFqOi_mmklS-5O_jApZ5zUuNUa-61jPF0z9fLWKo2AwyyEcfZ4yMUTPkNKjBnxz2raetlvgVuzbBE0YI2VXwP-f_o-c5d8wdpRm';
                var fcm = new FCM(serverKey);
                fcm.send(new_message, function (err, response) {
                    console.log(response, "--------------------------here i am")
                    if (err) {
                        console.log(err, "new_message");
                    } else {
                        console.log("push sent");
                    }
                });
            }
        }

    },
    check_socket_id: async function (connect_listener, socket_id) {
    
    
    
        let check_user = await socket_user.findOne({
            where: {
                userId: connect_listener.userId
            }
        });
        // console.log(">>>>>>>>>>>>>>>>>>>>>",check_user)
        
        
       
        

        // console.log(check_user, "check_user");return;

        if (check_user) {

            create_socket_user = await socket_user.update({
                isOnline: 1,
                socketId: socket_id,
            },
                {
                    where: {
                        userId: connect_listener.userId
                    }
                }
            );

        } else {
            create_socket_user = await socket_user.create({
                userId: connect_listener.userId,
                socketId: socket_id,
                isOnline: 1,
                created: await this.create_time_stamp(),
                updated: await this.create_time_stamp()
            })
        }
        return create_socket_user;

    },
    socket_disconnect: async function (socket_id) {
        /* console.log(socket_id,"socket_id") */
        let disconnect_socket_user = await socket_user.update({
            isOnline: 0,
            updated: await this.create_time_stamp()
        },
            {
                where: {
                    socketId: socket_id
                }
            }
        );
        return disconnect_socket_user
    },
    send_message: async function (get_data) {


        var user_data = await chatConstants.findOne({
            where: {

                [Op.or]: [
                    { senderId: get_data.senderId, receiverId: get_data.receiverId },
                    { receiverId: get_data.senderId, senderId: get_data.receiverId }

                ]
            }
        });

        if (user_data) {

            create_message = await messages.create({
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
                messageType: get_data.messageType,
                message: get_data.message,
                chatConstantId: user_data.dataValues.id,
                created: await this.create_time_stamp(),
                updated: await this.create_time_stamp(),
            });

            let update_last_message = await chatConstants.update({

                lastMessageId: create_message.dataValues.id,
                deletedId: 0
            },
                {
                    where: {
                        id: user_data.dataValues.id
                    }
                }
            );


        } else {

            let create_last_message = await chatConstants.create({
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
                lastMessageId: 0,
                created: await this.create_time_stamp(),
                updated: await this.create_time_stamp(),
            });

            create_message = await messages.create({
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
                messageType: get_data.messageType,
                message: get_data.message,
                chatConstantId: create_last_message.dataValues.id,
                created: await this.create_time_stamp(),
                updated: await this.create_time_stamp(),
            });

            let update_last_message = await chatConstants.update({

                lastMessageId: create_message.dataValues.id
            },
                {
                    where: {
                        id: create_last_message.dataValues.id
                    }
                }
            );


            return create_message;
        }
    },
    GetChat: async function (msg) {
        console.log(msg, "------------------------------")
        var constant_check = await chatConstants.findOne({
            where: {
                [Op.or]: [
                    { senderId: msg.senderId, receiverId: msg.receiverId },
                    { senderId: msg.receiverId, receiverId: msg.senderId }
                ]
            }
        });



        if (constant_check) {



            constant_check = constant_check.toJSON();
            console.log("constant_________________check");

            var get_message = await messages.findAll({
                attributes: ['id', 'message', 'readStatus', 'messageType', 'created',
                    [sequelize.literal('(SELECT username FROM user WHERE user.id  = messages.senderId)'), 'SenderName'],
                    [sequelize.literal('(SELECT id FROM user WHERE user.id  = messages.senderId)'), 'SenderID'],
                    [sequelize.literal('(SELECT image  FROM user_images WHERE  type = 1 AND user_images.user_id  = messages.senderId LIMIT 1)'), 'SenderImage'],
                    [sequelize.literal('(SELECT username FROM user WHERE user.id  =  messages.receiverId)'), 'ReceiverName'],
                    [sequelize.literal('(SELECT id FROM user WHERE user.id  = messages.receiverId)'), 'ReceiverId'],
                    [sequelize.literal('(SELECT image FROM user_images WHERE  type = 1 AND user_images.user_id  = messages.receiverId LIMIT 1)'), 'ReceiverImage']
                ],

                where: {
                    chatConstantId: constant_check.id,
                    deletedId: {
                        [Op.ne]: msg.senderId
                    }
                }
            });
            console.log(get_message, "================getmessage")

            let updatereadstatus = await messages.update({
                readStatus: 1
            }, {
                where: {
                    senderId: msg.receiverId,
                    receiverId: msg.senderId
                }
            })


            if (updatereadstatus) {
                get_message = get_message.map(val => {
                    var data = val.toJSON();
                    // data.user_name="";senderId
                    // var tim1 =  Math.round(tm1.getTime() / 1000);
                    // data.createdAt =tim1;
                    return data;
                });
                return get_message;
            }
        } else {
            return []
        }
    },
    send_group_message: async function (get_data) {
        let checkIfGroup = await groups.findOne({
            where: {
                id: get_data.groupId
            }
        });

        if (checkIfGroup) {
            var user_data = await chatConstants.findOne({
                where: {
                    senderId: get_data.senderId,
                    groupId: get_data.groupId
                }
            });

            if (user_data) {

                create_message = await messages.create({
                    senderId: get_data.senderId,
                    receiverId: 0,
                    groupId: get_data.groupId,
                    messageType: get_data.messageType,
                    message: get_data.message,
                    // thumbnail: get_data.thumbnail,
                    // lat: get_data.lat,
                    // lng: get_data.lng,
                    // replyMessageId: replyMessageId,
                    // replyMessageOwnerId: replyMessageOwnerId,
                    // replyMessage: replyMessage,
                    // replyMessageType: replyMessageType,
                    chatConstantId: user_data.dataValues.id,
                    // caption: get_data.caption,
                    created: await this.create_time_stamp(),
                    updated: await this.create_time_stamp(),
                });

                let update_last_message = await chatConstants.update({

                    lastMessageId: create_message.dataValues.id,
                    deletedId: 0
                },
                    {
                        where: {
                            id: user_data.dataValues.id
                        }
                    }
                );

                return {
                    create_message: create_message
                    // isBroadcast: 0
                };

                // return create_message;

            } else {

                let create_last_message = await chatConstants.create({
                    senderId: get_data.senderId,
                    receiverId: 0,
                    groupId: get_data.groupId,
                    lastMessageId: 0,
                    created: await this.create_time_stamp(),
                    updated: await this.create_time_stamp(),
                });

                create_message = await messages.create({
                    senderId: get_data.senderId,
                    receiverId: 0,
                    groupId: get_data.groupId,
                    messageType: get_data.messageType,
                    // replyMessageId: replyMessageId,
                    // replyMessageOwnerId: replyMessageOwnerId,
                    // replyMessage: replyMessage,
                    // replyMessageType: replyMessageType,
                    message: get_data.message,
                    // thumbnail: get_data.thumbnail,
                    // lat: get_data.lat,
                    // lng: get_data.lng,
                    chatConstantId: create_last_message.dataValues.id,
                    // caption: get_data.caption,
                    created: await this.create_time_stamp(),
                    updated: await this.create_time_stamp(),
                });

                let update_last_message = await chatConstants.update({

                    lastMessageId: create_message.dataValues.id
                },
                    {
                        where: {
                            id: create_last_message.dataValues.id
                        }
                    }
                );

                return {
                    create_message: create_message
                    // isBroadcast: 0
                };

                // return create_message;
            }
        } else {

        }
    },

    get_reciever_data: async function (get_data) {

        get_reciever_data = await socket_user.findOne({

            where: {
                userId: get_data.receiverId
            }

        });

        return get_reciever_data

    },
    get_user_data: async function (get_data) {

        get_user_data = await socket_user.findOne({

            where: {
                userId: get_data.userId
            },
            raw: true

        });
        return get_user_data

    },

    get_reciever_device_token: async function (get_data) {

        get_reciever_token = await users.findOne({
            atrributes: ['id', 'deviceToken', 'deviceType', 'notificationStatus'],
            where: {
                id: get_data.receiverId,
                // notificationStatus: 0
            }
        });

        return get_reciever_token


    },
    data_to_send: async function (get_data) {
        final_array = [];

        //console.log("innnnnnnnnnnnn");return

        get_sender_detail = await users.findOne({
            l


        })
        if (get_sender_detail.role == 1) {
            get_sender_detail = await user_detail.findOne({
                attributes: ['id', 'name', 'image'],
                where: {

                    userId: get_data.senderId
                }

            })
            get_sender_detail = get_sender_detail.toJSON()
            console.log(get_sender_detail)

        }



        //////////////////////////////
        get_receiver_detail = await users.findOne({

            where: {
                role: [1, 2],
                id: get_data.receiverId
            }
        })
        if (get_receiver_detail.role == 1) {
            get_receiver_detail = await user_detail.findOne({
                attributes: ['id', 'name', 'image'],
                where: {

                    userId: get_data.receiverId
                }

            })
            get_receiver_detail = get_receiver_detail.toJSON()
            console.log(get_receiver_detail)

        }
        if (get_receiver_detail.role == 2) {
            get_receiver_detail = await photographer_detail.findOne({
                attributes: ['id', 'name', 'image'],
                where: {

                    userId: get_data.receiverId
                }

            })
            get_receiver_detail = get_receiver_detail.toJSON()
            console.log(get_receiver_detail)

        }


        get_all_data_chat = await messages.findOne({
            where: {


                [Op.or]: [
                    { senderId: get_data.senderId, receiverId: get_data.receiverId },
                    { receiverId: get_data.senderId, senderId: get_data.receiverId }

                ]
            },
            order: [
                ['id', 'desc']
            ],
            limit: 1,
            raw: true
        })
        get_all_data_chat.sendername = get_sender_detail.name,
            get_all_data_chat.senderimage = get_sender_detail.image,
            get_all_data_chat.receivername = get_receiver_detail.name,
            get_all_data_chat.receiverimage = get_receiver_detail.image
        console.log(get_all_data_chat.receivername, "===sendername")
        // console.log(get_all_data_chat,"get_all_data_chat");return
        // final_array = {
        //   senderId: get_data.senderId,
        //   receiverId: get_data.receiverId,
        //   messageType: get_data.messageType,
        //   message: get_data.message,
        //   senderName:get_sender_image.firstName,
        //   senderImage:get_sender_image.image,
        //   recieverImage:get_reciever_image.image,
        //   recieverName:get_reciever_image.firstName,
        //   created: await this.create_time_stamp(),

        // }
        return get_all_data_chat;


    },
    data_to_send_group: async function (get_data) {
        final_array = [];

        //console.log("innnnnnnnnnnnn");return
        get_sender_image = await users.findOne({
            atrributes: ['id', 'firstName', 'image'],
            where: {
                id: get_data.create_message.dataValues.senderId
            },
            raw: true
        })

        get_all_data_chat = await messages.findOne({
            where: {
                id: get_data.create_message.dataValues.id
            },
            order: [
                ['id', 'desc']
            ],
            limit: 1,
            raw: true
        })
        get_all_data_chat.senderName = get_sender_image.firstName,
            get_all_data_chat.senderImage = get_sender_image.image

        return get_all_data_chat;

    },
    findGroupUsers: async function (get_data) {
        // console.log(get_data);
        //let othergroupusersId=[];
        all_group_users = await group_users.findAll({
            attributes: ['id', 'unreadcount', 'userId', 'notification', [sequelize.literal('ifnull((SELECT socketId FROM socket_user WHERE userId = group_users.user_id LIMIT 1),"")'), 'socketId'], [sequelize.literal('ifnull((SELECT device_token FROM user WHERE id = group_users.user_id),"")'), 'device_token'], [sequelize.literal('ifnull((SELECT device_type FROM user WHERE id = group_users.user_id),"")'), 'device_type']],

            // [sequelize.literal('ifnull((SELECT notification_on_off FROM users WHERE id = groupUsers.user_id),"")'), 'notification_on_off']
            where: {
                groupId: get_data.groupId,
                //isAccepted: 1,
                [Op.not]: {
                    userId: get_data.senderId
                }
            }

        });

        // console.log(all_group_users);
        // return
        all_group_users = all_group_users.map(data => {
            data = data.toJSON();
            // othergroupusersId.push(data.id);
            return data;
        });

        return all_group_users;
        // return {
        //   all_group_users: all_group_users,
        //   othergroupusersId: othergroupusersId
        // }

    },
    get_block_status_users: async function (get_data) {

        get_user_block_status = await chatBlock.findOne({
            atrributes: ['id'],
            where: {
                [Op.or]: [
                    { userBy: get_data.senderId, UserTo: get_data.receiverId },
                    { UserTo: get_data.senderId, userBy: get_data.receiverId }

                ]
            }
        });

        /*  console.log(get_user_block_status,"get_user_block_status"); */

        return get_user_block_status;
    },
    get_message: async function (get_msg_data) {

      var  get_user_status = await chatConstants.findOne({
        where: {
            [Op.or]: [
              { senderId: get_msg_data.senderId, receiverId: get_msg_data.receiverId },
              { senderId: get_msg_data.receiverId, receiverId: get_msg_data.senderId }
            ]
          }
        });
console.log("11111111111111111111111",get_user_status);


        if (get_user_status) {
            console.log("iffffffffffffffffffffffffffffffffffffffffffffff");
            
      constant_check = get_user_status.toJSON();
      var get_message = await messages.findAll({

          attributes: ['id', [sequelize.literal('(SELECT name FROM users WHERE users.id  = messages.senderId)'), 'SenderName'], 'message',
				[sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.senderId)'), 'SenderID'],
				[sequelize.literal('(SELECT image FROM users WHERE users.id  = messages.senderId)'), 'SenderImage'],
				[sequelize.literal('(SELECT name FROM users WHERE users.id  =  messages.receiverId)'), 'ReceiverName'],
				[sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.receiverId)'), 'ReceiverId'],
				[sequelize.literal('(SELECT image FROM users WHERE users.id  = messages.receiverId)'), 'ReceiverImage'], 'messageType', 'created'],

        where: {
            chatConstantId: get_user_status.id,
          deletedId	: {
            [Op.ne]: get_msg_data.senderId
          }
        }
      });
      console.log("2222222222222222222222222222",get_message)
      if (get_message) {
        get_message = get_message.map(val => {
          var data = val.toJSON();
          console.log("3333333333333333333",data);
          
          // data.user_name="";
          // data.user_image=""
          // var tm1 =new Date(data.created_at);
          // var tim1 =  Math.round(tm1.getTime() / 1000);
          // data.createdAt =tim1;
          return data;
        });
        return get_message;
      }
    } 
    },
    get_chat_listing: async function (get_chat_data) {
        console.log("ijnnnnnnnnnnn");
        var get_user_status = await db.user.findOne({
            where: {
                id: get_chat_data.userId
            }
        });
        //  console.log(get_user_status.dataValues.status,"get_user_status");return
        // if (get_user_status.dataValues.status == 1) {

        var chat_data = await database.query(`select *,(select Count(*) from messages where (receiverId=${get_chat_data.userId} and senderId=${get_chat_data.userId}) and (readStatus=0) ) as unreadcount  from (SELECT *,CASE WHEN senderId = ${get_chat_data.userId} THEN receiverId WHEN receiverId = ${get_chat_data.userId} THEN senderId  END AS user_idd,(SELECT message FROM messages where id=lastMessageId and deletedId!=${get_chat_data.userId}) as lastMessage,(SELECT case when count(id)=0 then 0 else 1 end as countss FROM blockusers WHERE (block_by= chatConstants.senderId AND block_to = ${get_chat_data.userId}) OR (block_to= chatConstants.receiverId AND block_by = ${get_chat_data.userId}) ) as is_blocked, (SELECT case when count(id)=0 then 0 else 1 end as countss FROM reported_users WHERE (reported_userid = chatConstants.senderId AND reported_by = ${get_chat_data.userId}) OR (reported_by = chatConstants.receiverId AND reported_userid = ${get_chat_data.userId}) ) as is_report ,(SELECT username FROM user where id=user_idd) as userName, ifnull((SELECT image FROM user_images where user_images.user_id=chatConstants.senderId AND chatConstants.receiverId = ${get_chat_data.userId} OR user_images.user_id=chatConstants.receiverId AND chatConstants.senderId = ${get_chat_data.userId} AND type = 1 LIMIT 1),'') as userImage,(SELECT  created  FROM messages where id=lastMessageId) as created_at ,(SELECT  messageType  FROM messages where id=lastMessageId) as messageType,ifnull((SELECT  isOnline  FROM socketUser where userId=${get_chat_data.userId}),0) as isOnline from chatConstants where (senderId=${get_chat_data.userId} or receiverId=${get_chat_data.userId}))tt where deletedId!=${get_chat_data.userId} order by lastMessageId desc`, {

            model: messages,
            model: chatConstants,
            mapToModel: true,
            type: database.QueryTypes.SELECT
        })


        if (chat_data) {
            chat_data = chat_data.map(value => {
                return value.toJSON();
            });
        }
        //  console.log(chat_data,"chat_data");return
        return chat_data;
        // }
    },
    get_group_chat_listing: async function (get_data) {

        get_group_listing = await group_users.findAll({
            // include: [{
            //   model: groups,
            //   attributes: ['id','groupName','groupIcon']
            // }],
            attributes: ['id', 'groupId', 'userId', 'unreadcount', 'notification'],
            where: {
                userId: get_data.userId,
            }
        });

        let groupIds = [];

        if (get_group_listing.length > 0) {
            get_group_listing = await get_group_listing.map(group => {
                if (group.dataValues.isAdmin == 0) {
                    // if(group.dataValues.isBroadcast == 0) {
                    groupIds.push(group.groupId);
                    // }
                } else {
                    groupIds.push(group.groupId);
                }
            });

            if (groupIds.length > 0) {
                get_group_listing = await groups.findAll({
                    attributes: ['id', 'name', 'image', 'createdAt', [sequelize.literal('(SELECT COUNT(id) FROM group_users WHERE group_id = groups.id)'), 'totalUsers'], [sequelize.literal(`(SELECT unreadcount FROM group_users WHERE group_id = groups.id AND user_id = ${get_data.userId})`), 'unreadcount'], [sequelize.literal('ifnull((SELECT message FROM messages WHERE groupId = groups.id order by id desc limit 1),"")'), 'lastMessage'], [sequelize.literal('ifnull((SELECT created FROM messages WHERE groupId = groups.id order by id desc limit 1),groups.created_at)'), 'lastMessageCreated'], [sequelize.literal('ifnull((SELECT messageType FROM messages WHERE groupId = groups.id order by id desc limit 1),0)'), 'messageType'], [sequelize.literal('(SELECT user_id FROM group_users WHERE group_id = groups.id and is_admin = 1)'), 'adminId'], [sequelize.literal('(SELECT count(id) from messages where groupId = groups.id)'), 'groupMessagesCount'], [sequelize.literal('(SELECT count(id) from group_messages_delete where groupId = groups.id and userId = ' + get_data.userId + ')'), 'deleteMessagesCount']],
                    where: {
                        id: {
                            [Op.in]: groupIds
                        }
                    },
                    order: [[sequelize.col('lastMessageCreated'), 'DESC']]
                });

                // console.log(get_group_listing);
                // return false;

                if (get_group_listing) {
                    get_group_listing = get_group_listing.map(group => {
                        group = group.toJSON();
                        if (group.groupMessagesCount == group.deleteMessagesCount) {
                            group.lastMessage = "";
                        }
                        // delete group.groupMessagesCount;
                        // delete group.deleteMessagesCount;
                        group.userId = get_data.userId;
                        group.groupId = group.id;
                        if (group.image != '') {
                            group.image = group.image;
                        }
                        // return group.toJSON();
                        return group;
                    });

                    return get_group_listing

                } else {
                    // return get_group_listing
                    return [];
                }
            } else {
                // return get_group_listing
                return [];
            }
        } else {
            // return get_group_listing
            return [];
        }

    },
    block_user: async function (get_block_data) {

        get_block_user = await blockedUser.findOne({
            where: {
                userId: get_block_data.userId,
                user2Id: get_block_data.user2Id,
                // status: 1
            }
        });
        if (get_block_user) {
            /*  console.log(get_block_user,"get_block_user") */
            /*     return get_block_user; */
            if (get_block_data.status == 1) {
                /*    console.log() */
                return false;
            } else {
                /*  console.log("imnnnnnnnnnn ") */
                delete_block_user = await blockedUser.destroy({
                    where: {
                        userId: get_block_data.userId,
                        user2Id: get_block_data.user2Id

                    }
                });

                return delete_block_user;

            }
        } else {
            create_block_user = await blockedUser.create({
                userId: get_block_data.userId,
                user2Id: get_block_data.user2Id,
                // status: 1,
                // created: await this.create_time_stamp(),
                // updated: await this.create_time_stamp()
            });

            return create_block_user;
        }

    },
    delete_msg: async function (msg) {

        var find_id = await messages.findAll({
            where: {
                deletedId: 0,
                [Op.or]: [
                    { senderId: msg.senderId, receiverId: msg.receiverId },
                    { senderId: msg.receiverId, receiverId: msg.senderId }
                ]
            }
        })

        if (find_id != 0) {

            var clear_msg = await messages.update({
                deletedId: msg.senderId,
                read_status: 1
            },
                {
                    where: {
                        [Op.or]: [
                            { senderId: msg.senderId, receiverId: msg.receiverId },
                            { senderId: msg.receiverId, receiverId: msg.senderId }
                        ]
                    }
                });
            var updateconstant = await chatConstants.update({
                deletedId: msg.senderId
            },
                {
                    where: {
                        [Op.or]: [
                            { senderId: msg.senderId, receiverId: msg.receiverId },
                            { senderId: msg.receiverId, receiverId: msg.senderId }
                        ]
                    }
                })
        }
        else {
            const clear_msg = await messages.destroy({
                where: {
                    [Op.or]: [
                        { senderId: msg.senderId, receiverId: msg.receiverId },
                        { senderId: msg.receiverId, receiverId: msg.senderId }
                    ]
                }
            });
            var updateconstant = await chatConstants.destroy({
                where: {
                    [Op.or]: [
                        { senderId: msg.senderId, receiverId: msg.receiverId },
                        { senderId: msg.receiverId, receiverId: msg.senderId }
                    ]
                }
            });

        }
        return updateconstant;

    },
    single_chat_delete_users: async function (msg) {
        var find_id = await messages.findOne({
            where: {
                deletedId: 0,
                [Op.or]: [
                    { senderId: msg.senderId, receiverId: msg.receiverId },
                    { senderId: msg.receiverId, receiverId: msg.senderId }
                ],
                id: msg.messageId
            }
        })

        if (find_id) {

            var clear_msg = await messages.update({
                deletedId: msg.senderId,
                read_status: 1
            },
                {
                    where: {
                        [Op.or]: [
                            { senderId: msg.senderId, receiverId: msg.receiverId },
                            { senderId: msg.receiverId, receiverId: msg.senderId }
                        ],
                        id: msg.messageId
                    }
                });


        } else {
            var message_destroy = await messages.destroy({
                where: {
                    [Op.or]: [
                        { senderId: msg.senderId, receiverId: msg.receiverId },
                        { senderId: msg.receiverId, receiverId: msg.senderId }
                    ],
                    id: msg.messageId

                }
            })

        }

    },
    delete_chat_users: async function (get_delete_data) {
        get_delete_status = await messages.findAll({
            where: {
                deletedId: 0,
                [Op.or]: [
                    { senderId: get_delete_data.userId, receiverId: get_delete_data.user2Id },
                    { receiverId: get_delete_data.userId, senderId: get_delete_data.user2Id },
                ]
            }
        });
        if (get_delete_status) {
            get_delete_status = get_delete_status.map(value => {
                return value.toJSON();
            });
        }
        /* console.log(get_delete_status);return; */

        if (get_delete_status.length > 0) {

            delete_all_chat = await messages.update({
                deletedId: get_delete_data.userId
            },
                {
                    where: {
                        [Op.or]: [
                            { senderId: get_delete_data.userId, receiverId: get_delete_data.user2Id },
                            { receiverId: get_delete_data.userId, senderId: get_delete_data.user2Id }

                        ]
                    }
                }
            );

            /*    console.log(update_delete_id, "update_delete_id") */
        } else {
            delete_all_chat = await messages.destroy({
                where: {
                    [Op.or]: [
                        { senderId: get_delete_data.userId, receiverId: get_delete_data.user2Id },
                        { receiverId: get_delete_data.userId, senderId: get_delete_data.user2Id }
                    ]
                }
            })
        }
        return delete_all_chat;
    },
    clear_group_chat: async function (get_data) {
        let groupId = get_data.groupId;
        let userId = get_data.userId;

        let getAllGroupMessages = await messages.findAll({
            attributes: ['id'],
            where: {
                groupId: groupId
            }
        });

        if (getAllGroupMessages) {
            getAllGroupMessages = getAllGroupMessages.map(data => {
                return data.toJSON();
            });

            // console.log(getAllGroupMessages);

            let deleteArray = [];

            for (let i in getAllGroupMessages) {
                let checkIfExists = await group_messages_delete.findOne({
                    where: {
                        messageId: getAllGroupMessages[i].id,
                        groupId: groupId,
                        userId: userId
                    }
                });

                if (!checkIfExists) {
                    deleteArray.push({
                        messageId: getAllGroupMessages[i].id,
                        groupId: groupId,
                        userId: userId
                    });
                }
            }

            // console.log(deleteArray);

            await group_messages_delete.bulkCreate(deleteArray);

            return;
        } else {
            return;
        }
    },
    leave_group: async function (get_data) {

        let findGroupUser = await group_users.findOne({
            where: {
                userId: get_data.userId,
                groupId: get_data.groupId
            }
        });

        if (findGroupUser) {
            // findGroupUser = findGroupUser.toJSON();

            let leaveGroup = await group_users.destroy({
                where: {
                    userId: get_data.userId,
                    groupId: get_data.groupId
                }
            });

            let deleteGroupDltMsg = await group_messages_delete.destroy({
                where: {
                    userId: get_data.userId,
                    groupId: get_data.groupId
                }
            });

            return;
        } else {

        }

    },
    report_user: async function (get_report_data) {
        console.log(get_report_data, "get_report_data")

        let get_all_ = await chatReport.findAll({
            raw: true
        })
        //console.log(get_all_,"get_all_");return
        create_report = await chatReport.create({
            user_by: get_report_data.userId,
            user_to: get_report_data.user2Id,
            message: get_report_data.message,
            created: await this.create_time_stamp(),
            updated: await this.create_time_stamp()
        });

        return create_report;
    },

    report_group: async function (get_report_data) {
        // console.log(get_report_data,"get_report_data")

        let get_all_ = await group_chat_report.findAll({
            raw: true
        })
        //console.log(get_all_,"get_all_");return
        create_report = await group_chat_report.create({
            userId: get_report_data.userId,
            groupId: get_report_data.groupId,
            message: get_report_data.message,
            createdAt: await this.create_time_stamp(),
            updatedAt: await this.create_time_stamp()
        });

        return create_report;
    },
    call_connect: async function (get_call_status_data) {

        get_call_status = await callHistory.findOne({
            where: {
                senderId: get_call_status_data.senderId,
                receiverId: get_call_status_data.receiverId,
                // callStatus: 0,
                // [Op.or]: [
                // { senderId: get_call_status_data.senderId, receiverId: get_call_status_data.receiverId },
                // { receiverId: get_call_status_data.senderId, senderId: get_call_status_data.receiverId }
                // ]
            },
            order: [
                ['id', 'DESC'],
            ],
            raw: true
        });
        console.log(get_call_status, "=========check");
        if (get_call_status) {
            // console.log(get_call_status,"get_call_status")
            // return;
            // return get_call_status; /
            // if (get_call_status_data.callStatus == 1) {
            // / console.log() /
            // return false;
            // } else {
            // console.log("imnnnnnnnnnn ") /
            update_call_status = await callHistory.update({
                callStatus: get_call_status_data.callStatus,
            },
                {
                    where: {
                        id: get_call_status.id
                    }
                }
            );

            return get_call_status_data.callStatus;

            // }
        } else {
            return get_call_status_data.callStatus;
        }
    },
    get_reciever_data_call: async function (get_data) {

        get_reciever_data = await socket_user.findOne({

            where: {
                userId: get_data.receiverId,
                // [Op.or]: [
                // { userId: get_data.senderId},
                // { userId: get_data.receiverId }
                // ]
            }

        });
        return get_reciever_data

    },

    get_call_user_status: async function (get_data) {
        get_call_status_data = await callHistory.findOne({
            where: {
                [Op.or]: [
                    { senderId: get_data.senderId, receiverId: get_data.receiverId },
                    { receiverId: get_data.senderId, senderId: get_data.receiverId }
                ]
            },
            order: [
                ['id', 'DESC'],
            ],
        });
        return get_call_status_data
    },

    get_block_status: async function (get_block_status) {

        get_block_status_data = await blockedUser.findOne({
            where: {

                // userId: get_block_status.userId,
                // user2Id: get_block_status.user2Id
                [Op.or]: [
                    { userId: get_block_status.userId, user2Id: get_block_status.user2Id },
                    { user2Id: get_block_status.userId, userId: get_block_status.user2Id }

                ]
            }
        });

        /* console.log(get_block_status_data,"get_block_status_data"); */
        return get_block_status_data;
    },
    get_read_unread_status: async function (get_read_status) {

        update_read_status = await messages.update({
            readStatus: 1
        },
            {
                where: {
                    senderId: get_read_status.user2Id,
                    receiverId: get_read_status.userId
                }
            }
        );

        return update_read_status;

    },
    get_blocked_user_status: async function (get_data) {

        get_block_status_data = await chatBlock.findOne({
            where: {

                [Op.or]: [
                    { userBy: get_data.senderId, userTo: get_data.receiverId },
                    { userTo: get_data.senderId, userBy: get_data.receiverId }

                ]
            }
        });
        return get_block_status_data

    },
    delete_chat_list_data: async function (get_data) {

        get_block_status_data = await chatConstants.findOne({
            where: {

                [Op.or]: [
                    { senderId: get_data.userId, receiverId: get_data.user2Id },
                    { receiverId: get_data.userId, senderId: get_data.user2Id }

                ]
            }
        });
        // console.log(get_block_status_data,"get_block_status_data");return;

        if (get_block_status_data.dataValues.deletedId != 0) {
            // console.log("innnnnnnnnnnnnn")
            delete_chat_list_data_user = await chatConstants.destroy({
                where: {
                    id: get_block_status_data.dataValues.id
                }
            });

            delete_all_messages = await messages.destroy({

                where: {
                    [Op.or]: [
                        { senderId: get_data.userId, receiverId: get_data.user2Id },
                        { receiverId: get_data.userId, senderId: get_data.user2Id }

                    ]
                }
            });

        } else {

            delete_chat_list_data_user = await chatConstants.update({
                deletedId: get_data.userId
            },
                {
                    where: {
                        [Op.or]: [
                            { senderId: get_data.userId, receiverId: get_data.user2Id },
                            { receiverId: get_data.userId, senderId: get_data.user2Id }

                        ]
                    }
                }
            );

            delete_all_messages = await messages.update({
                deletedId: get_data.userId
            },
                {
                    where: {

                        [Op.or]: [
                            { senderId: get_data.userId, receiverId: get_data.user2Id },
                            { receiverId: get_data.userId, senderId: get_data.user2Id }

                        ]
                    }
                }
            );

        }

        return delete_chat_list_data_user;
    },
    update_location: async function (get_data) {
        try {

            get_current_time = await this.create_time_stamp()
            get_existance = await providerLocations.count({
                where: {
                    providerId: get_data.providerId,

                }
            });
            if (get_existance > 0) {

                create_provider_location = await providerLocations.update({
                    latitude: get_data.latitude,
                    longitude: get_data.longitude,
                    location: get_data.location,
                    updated: get_current_time
                },
                    {
                        where: {
                            providerId: get_data.providerId,
                        }
                    }
                );
            } else {
                create_provider_location = await providerLocations.create({
                    latitude: get_data.latitude,
                    longitude: get_data.longitude,
                    location: get_data.location,
                    updated: get_current_time,
                    created: get_current_time,
                    providerId: get_data.providerId,
                })
            }

            return create_provider_location

        } catch (error) {
            throw error
        }
    },
    image_base_64: async function (get_messagetype, get_message, extension_data) {
        var image = get_message
        console.log(image, "==================image")

        if (get_messagetype == 2) {
            // console.log("here",extension_data)
            var data = image.replace(/^data:image\/\w+;base64,/, '');
        } else if (get_messagetype == 4) {
            var data = image.replace(/^data:video\/\w+;base64,/, '');
        } else if (get_messagetype == 3) {
            var data = image.replace(/^data:audio\/\w+;base64,/, '');
        }
        var extension = extension_data;
        var filename = Math.floor(Date.now() / 1000) + '.' + extension;
        var base64Str = data;
        var upload_path = path.join(__dirname, '../public/uploads/images/' + filename);

        if (extension) {
            fs.writeFile(upload_path, base64Str, {
                encoding: 'base64'
            }, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
        return filename;
    }
}