import { Server } from "socket.io";
import Chat from "./models/Chat.js";
import ChatTimimg from "./models/ChatTiming.js";
import exactMath from 'exact-math';

const MathConfig = { returnString: true, eMinus: Infinity, ePlus: Infinity };


const getChatRoom = (first_id, second_id) => {
  return `ChatRoom${first_id}_${second_id}`;
};

async function getuserId(req, res) {
  return req.session.users?.id;
}

export function socketIo(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      // credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("chattimimg", async (user_id) => {
      console.log("user_id", user_id);
      let data = {
        socket_id: socket.id,
        user_id: user_id,
        intime: Math.floor(Date.now() / 1000),
        online: "1",
        outtime:"",
        min_difference:"",
        sec_difference:""
      };

      console.log(data);
      if (
        data?.socket_id != "" &&
        data?.user_id != "" &&
        data?.intime != "" &&
        data?.online != ""
      ) {
        let chatting = await ChatTimimg.findOne({
          where: {
            user_id: user_id,
          },
        });
        if (!chatting) {
          await ChatTimimg.create(data);
        } else {
          await ChatTimimg.update(data, {
            where: {
              user_id: user_id,
            },
          });
        }
      }
    });

    socket.on("connectChatRoom", (id, receiver_id) => {
      if (id) {
        console.log("ChatRoom" + id + "_" + receiver_id);
        socket.join(getChatRoom(id, receiver_id));
      }
    });

    socket.on("send-msg", async (data) => {
      let first_id = data.to < data.from ? data.to : data.from;
      let second_id = data.to > data.from ? data.to : data.from;

      let chat_data = {
        from: data.from,
        to: data.to,
        msg: data.msg,
      };

      if (data?.from != "" && data?.to != "" && data?.msg.trim() != "") {
        await Chat.create(chat_data);
      }

      let receive_data = {
        msg: data.msg,
        from_self: data.from,
      };
      io.sockets
        .to(getChatRoom(first_id, second_id))
        .emit("msg-recieve", receive_data);
    });

    socket.on("disconnect", async function () {
      let chatting = await ChatTimimg.findOne({
        where: {
          socket_id: socket.id,
        },
      });
      if (chatting) {
        chatting.outtime = Math.floor(Date.now() / 1000);
        chatting.online = 0;
        let difference = exactMath.sub(Math.floor(Date.now() / 1000), chatting.outtime, MathConfig);
        let minutesDifference = Math.floor(difference/1000/60);
        let secondsDifference = Math.floor(difference/1000);
        chatting.min_difference = minutesDifference;
        chatting.sec_difference = secondsDifference;
        await chatting.save();
      }
    });
  });
}
