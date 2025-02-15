import reply from "../helper/reply.js";
import Chat from "../models/Chat.js";
import Report from "../models/Report.js";
import Validator from "validatorjs";

export default {
  async deleteChat(req, res) {
    let request = req.body;

    await Chat.destroy({
      where: {
        from: request.from,
        to: request.to
      },
    });

    return res.json(reply.success("Chat deleted successfully"));
  },

  async createReport(req, res) {

    let request = req.body;

    let validation = new Validator(request, {
      'msg': 'required',
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let data = {
      report_from: request.report_from,
      report_to: request.report_to,
      msg: request.msg
    }
    
    await Report.create(data);

    return res.json(reply.success("Report created successfully"))

  },

  async BlockUser(req,res){

    let request  = req.body;
    let validation = new Validator(request, {
      'from': 'required',
      'to': 'required'
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let blocking = await Chat.update({
      block: request.type
    },{
      where:{
        from: request.from,
        to: request.to
      }
    })

    let suc_message = request.type == "1" ? "User blocked successfully" : "User unblocked successfully";
    let fail_message = request.type == "1" ? "Unable to block user" : "Unable to unblock user";

    return blocking ? res.json(reply.success(suc_message)): res.json(reply.failed(fail_message))


  },

  async readMsg(req,res){

    let request  = req.body;
    let validation = new Validator(request, {
      'from': 'required',
      'to': 'required'
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    console.log({from: request.from, to: request.to});
    let read_msg = await Chat.update({
      read: "1"
    },{
      where:{
        from: request.from,
        to: request.to
      }
    })

    return read_msg ? res.json(reply.success("success")): res.json(reply.failed("failed"))


  }
};
