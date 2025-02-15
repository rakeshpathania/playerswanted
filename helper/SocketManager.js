let io,
miniSocket,
redis,
models = require("../models"),
helper = require("../helpers/helper");
console.log("333333333333333333333333333")
exports.connectSocket = (server,redisClient) => {
console.log("1111111111111111111")
try {
    console.log("222222222222222")
    redis = redisClient;
    io = require('socket.io').listen(server);
    io.on('connection', async (socket) => {
        miniSocket = socket;
        console.log(socket.id, "----------------------socket.handshake.query.id ============== ",socket.handshake.query.id)
        if (socket.handshake.query.id){ await redisClient.set(socket.handshake.query.id, socket.id); }
        
        socket.on('send_message', async (data, ack) => {
            try {
                data = (typeof data === 'object') ? data : JSON.parse(data)
                let dataToSave = data;
                dataToSave.thread_id =  (data.receiver_id > data.sender_id) ? (data.receiver_id + data.sender_id) : (data.sender_id + data.receiver_id)
                if (data.receiver_id && data.receiver_id !== '') {
                    dataToSave.receiver_id = data.receiver_id;
                }
                await models['chat'].create(dataToSave);
                let getSocketId = await redisClient.get(data.receiver_id);
                console.log(getSocketId,"==========================",data.receiver_id)
                io.to(getSocketId).emit("send_message", dataToSave);
                helper.sendSocketPushNotificationData(models['user'],data.receiver_id, data.sender_id, " sent you a new message", data.chat_data);
                ack(dataToSave);
            }
            catch (er) {
                console.log(er);
                //ack(er);
            }
        });

        socket.on('like_dislike_user', async (data, ack) => {
            console.log("11111111111222222222",data)
            try {
                var dataToSave = {
                    by_user:data.by_user,
                    swiped_user:data.swiped_user,
                    action:data.action,//0 - dislike, 1 - like
                }
                let getSocketId = await redisClient.get(data.swiped_user);
                var swiped_user_data = await models['user'].findOne({ 
                    where:{  "id":data.by_user, },
                    attributes: [ "id", "location", "latitude", "longitude", ],
                    include: [{ model: models['userDetail'], required: false, attributes: ["name", "image" ]} ]
                });
                if(data.action=="0"){
                    models['swiped_data'].create(dataToSave);
                }else{
                    var swiped_data_id = await models['swiped_data'].findOne({ 
                        where: {
                            by_user:data.swiped_user,
                            swiped_user:data.by_user
                        }
                    }).then(async function(obj) {
                        if(obj){
                            var friendsData = {
                                user_id:data.by_user,
                                friend_id:data.swiped_user,
                                status:"2"
                            }
                            models['friends'].create(friendsData);
                            //ack(swiped_user_data);
                        }
                        return models['swiped_data'].create(dataToSave);
                    })
                    helper.sendSocketPushNotificationData(models['user'],data.swiped_user, data.by_user, " liked your profile",{});                            
                }
                swiped_user_data.action = data.action;
                io.to(getSocketId).emit("like_dislike_user", swiped_user_data);
                ack(data);
            }
            catch (er) {
                console.log(er);
                ack(er);
            }
        });



        socket.on('call_status', async (data, ack) => {
            try {
                var dataToSave = {
                    channel_name:data.channel_name,
                    receiver_id:data.receiver_id,
                    sender_id:data.sender_id,
                    agora_status:data.agora_status
                }
                let getSocketId = await redisClient.get(data.receiver_id);
                await models['user'].update( dataToSave, { where: { id: data.sender_id, }, individualHooks: true } );
                await models['user'].update( dataToSave, { where: { id: data.receiver_id, }, individualHooks: true } );
                console.log("getSocketId ---- ",getSocketId)
                io.to(getSocketId).emit("call_status", dataToSave);
                //helper.sendSocketPushNotificationData(models['user'],data.swiped_user, data.by_user, " liked your profile");
                ack(data);
            }
            catch (er) {
                console.log(er);
                ack(er);
            }
        });

        socket.on('disconnect', function () {});

    });


}
catch (err) {
    console.log(err);
}
};


// exports.like_dislike_user = async function (data) {
//     try {

//         var dataToSave = {
//             by_user:data.by_user,
//             swiped_user:data.swiped_user,
//             action:data.action,//0 - dislike, 1 - like
//         }
//         var swiped_data_id = await models['swiped_data'].create(dataToSave);
//         return swiped_data_id;
//     } catch (error) {
//         console.log("error in forward messages in socket manager----", error);
//         throw error;
//     }
// };


// exports.createGroup = async function (data) {

//         let dataToSave = {
//             senderId: data.senderId,
//             conversationId: data.receiverId ? (data.receiverId > data.senderId ? (data.receiverId + data.senderId) : (data.senderId + data.receiverId)) : data.groupId,
//             text: data.createdBy.name+" created this group",  // set value here
//             type: Constants.DATABASE_CONSTANT.MESSAGE_TYPE.GROUP_NOTIFICATION  // set value here
//         };
//         dataToSave.receiverId = data.groupId;
//         dataToSave.groupId = data.groupId;
//         dataToSave.chatType = Constants.DATABASE_CONSTANT.MESSAGE_TYPE.GROUP_CHAT;
//         dataToSave.messageId = data.messageId;
//         dataToSave.members  = data.members;
//                         console.log("dataToSave..............",dataToSave)

//         let step1 = {},
//             step2 = await DAO.saveData(Models.Chat, dataToSave);

//         //let getSocketId = await redisClient.get((data.receiverId));
//         step1._id = step2._id;
//         step1.receiverId = step2.receiverId;
//         step1.senderId = step2.senderId;
//         step1.conversationId = step2.conversationId;
//         step1.groupId = step2.groupId;
//         step1.text = step2.text;
//         step1.type = step2.type;
//         step1.isDeleted = step2.isDeleted;
//         step1.isRead = step2.isRead;
//         step1.image = step2.image;
//         step1.createdAt = step2.createdAt;
//         step1.uid = data.uid;
//         step1.loading = false;
//         step1.userId = data.createdBy;
//         step1.isLike = '';
//         step1.LIKE = 0;
//         step1.UNLIKE = 0;
//         step1.HAHA = 0;
//         step1.LOVE = 0;
//         step1.WOW = 0;
//         step1.SAD = 0;
//         step1.ANGRY = 0;
//         //step1.replyObject = replyObject;
//         step1.chatType = step2.chatType;
//         step1.messageStatus = step2.messageStatus;
//         step1.contact = step2.contact;
//         step1.location = step2.location;
//         // step1.note = step2.note?step2.note:'' ;
//         step1.messageId = data.messageId;
//         step1.groupName = data.groupName;

//         console.log("step1 =========== ",step1)
//         let socketData = {}, socketID = '';
//         for (let i = 0; i < data.members.length; i++) {
//             socketID = await redis.get(data.members[i]);
//             console.log("=====socketData============", socketID);
//             socketData = io.sockets.connected[socketID];
//             console.log("===data.groupId=============",data.groupId);
//             console.log("===data.members[i]=============",data.members[i]);
//             /*console.log("===socketData=============",socketData);*/
//             if (socketData)
//                 socketData.join(data.groupId);
//         }
//         miniSocket.to(data.groupId).emit("messageFromServer", step1);

// };

// exports.emitSocketToUser = async function (data) {

//     // console.log("======emitSocketToUser=====data===emitSocketToUser==============",data);
//     if (data.chatType === Constants.DATABASE_CONSTANT.CHAT_TYPE.ONE_TO_ONE_CHAT) {
//         let getSocketId = await redis.get(data.receiverId);

//         console.log("====getSocketId==================", getSocketId);

//         if (getSocketId)
//             io.to(getSocketId).emit("listenCall", data);
//     }
//     else {
//         miniSocket.to(data.groupId).emit("listenCall", data);
//     }
// };

// exports.emitCloseSocket = async function (data) {

//     let getSocketId = await redis.get(data.receiverId);

//     if (getSocketId)
//         io.to(getSocketId).emit("exitCall", data);

// };

// exports.forwardMessage = async function (data) {
//     try {
//         let getSocketId = '',
//             dataToSave = await messagesToAdd(data),
//             insertedData = await DAO.insertMany(Models.Chat, dataToSave, {setDefaultsOnInsert: true});

//         if (data.receiverId)
//             getSocketId = await redis.get((data.receiverId));

//         if (data.groupId)
//             miniSocket.to(data.groupId).emit("messagesFromServer", insertedData.ops);
//         else
//             io.to(getSocketId).emit("messagesFromServer", insertedData.ops);

//         getSocketId = await redis.get(data.senderId);
//         io.to(getSocketId).emit("messagesFromServer", insertedData.ops);
//     } catch (error) {
//         console.log("error in forward messages in socket manager----", error);
//         throw error;
//     }
// };

// // messages to add to db
// function messagesToAdd (data) {
//     return data.messages.map(message =>  {
//         let insertData = {
//             info: [],
//             isClear: [],
//             isReply: false,
//             isDeleted: false,
//             deletedUserId: [],
//             LIKE                : 0,
//             UNLIKE              : 0,
//             HAHA                : 0,
//             LOVE                : 0,
//             WOW                 : 0,
//             SAD                 : 0,
//             ANGRY               : 0,
//             senderId: ObjectId(data.senderId),
//             conversationId: data.receiverId ?
//                 (data.receiverId > data.senderId ? (data.receiverId + data.senderId) :
//                     (data.senderId + data.receiverId)) : data.groupId,
//             text: message.text,
//             type: message.type,
//             createdAt: Date.now()
//         };
//         if (message.image)
//             insertData.image = message.image;

//         if (data.receiverId && data.receiverId !== '')
//             insertData.receiverId = ObjectId(data.receiverId);

//         if (data.groupId && data.groupId !== '')
//             insertData.groupId = ObjectId(data.groupId);

//         if (message.contact)
//             insertData.contact = message.contact;

//         if (message.location)
//             insertData.location = message.location;

//         return insertData;
//     });
// }

// exports.joinGroup = async function (data) {
//     console.log("=====joinGroup============", data.groupMembers.length);
//     let socketData = {}, socketID = '';
//     for (let i = 0; i < data.groupMembers.length; i++) {
//         socketID = await redis.get(data.groupMembers[i]);
//         console.log("=====socketData============", socketID);
//         socketData = io.sockets.connected[socketID];
//         // console.log("===socketData=============",socketData);
//         if (socketData)
//             socketData.join(data.groupId);
//     }

//     // let socketData = await   io.sockets.manager.roomClients[socket.id]
// };

// exports.deleteMessageSocket = async function (payload, chatData) {

//     console.log("===deleteMessageSocket=deleteMessageSocket ===", payload, chatData);

//     /*if (payload.scope === Constants.DATABASE_CONSTANT.SCOPE.ME) {
//         miniSocket.emit("messagesFromServer",await dataToSend(chatData));
//     }
//     else {*/

//         if (chatData[0].groupId) {
//             io.to(chatData[0].groupId).emit("messagesFromServer", await dataToSend(chatData));
//         }
//         else {
//             let getSocketId = await redis.get(chatData[0].receiverId);
//             let getSocketIdSender = await redis.get(chatData[0].senderId);
//             io.to(getSocketId).to(getSocketIdSender).emit("messagesFromServer", await dataToSend(chatData));
//         }
//     //}
// };

// function dataToSend(chatData) {
//     return chatData.map(data => {return {_id: data._id, isDeleted: true, conversationId: data.conversationId}});
// }

// exports.sendGroupSocket = async function (sendGroupSocket) {

//     miniSocket.to(sendGroupSocket.groupId).emit("messageFromServer", sendGroupSocket);
// };

// exports.sendHelloSocket = async function (payload) {

//     // miniSocket.to(sendGroupSocket.groupId).emit("messageFromServer",sendGroupSocket);
// };

// // social controller sockets
// exports.createPost = async function (data) {
//     console.log("111111 =================================data--------",data)
//     let followerData = await Models.Follow.find({"followedId": ObjectId(userData._id)},{followById:1});
//     let followerIds = [];
//     if(followerData.length > 0){
//         console.log("=================================data--------",data)
//         console.log("followerData--------",followerData)
//         for(let x of followerData){followerIds.push(ObjectId(x.followById))}
//         console.log("followerIds--------",followerIds)
//         for (let i = 0; i < followerIds.length; i++) {
//         console.log("followerIds[i]--------",followerIds[i])
//             //socketID = await redis.get(followerIds[i]);
//             /*socketData = io.sockets.connected[socketID];
//             if (socketData)
//                 socketData.join(data.groupId);*/

//             let getSocketId = await redis.get((followerIds[i]));
//             console.log("getSocketId--------",getSocketId)
//             io.to(getSocketId).emit("postList", JSON.stringify(data));
//         }
//         //miniSocket.to(data.groupId).emit("messageFromServer", step1);        
//     }
// };
// social controller sockets
