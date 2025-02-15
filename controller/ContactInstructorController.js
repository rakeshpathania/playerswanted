import ContactInstructor from "../models/ContactInstructor.js";
import reply from "../helper/reply.js";
import Validator from "validatorjs";
import User from "../models/users.js";

export default{
    async createQuery(req,res){
        let request = req.body;

        let validation = new Validator(request, {
            instructor_id: "required",
            name: "required",
            email: "required|email",
            phone_number: "required|numeric",
            subject: "required",
            message: "required",
          });
          if (validation.fails()) {
            return res.json(reply.failed(reply.firstError(validation)));
          }
          let user = req.session.users;
          let contactData={
            user_id: user?.id,
            instructor_id: request.instructor_id,
            name: request.name,
            email: request.email,
            phone_number: request.phone_number,
            subject:request.subject,
            message: request.message
          }

          let inst_mail = await User.findOne({
            where:{
              id: request.instructor_id
            },
            attributes: ['email','name']
          })

        
          reply.send(inst_mail.email, `<b>Hello, <strong>${inst_mail.name}</strong><br>You have an query from:\n<b>${user.name}</b>\n email:<b>${user.email}</b>\n<br> Query:<b>${request.message}</b>`);

          await ContactInstructor.create(contactData);
          return res.json(reply.success("Your query is submitted successfully"))

    }

   
}