
import nodeMailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();

export default  {
    success: (message , data = null  , extra = null) => {
     var result = {
         status_code: "1",
         status_text: "success",
         message: message,
     };

     if(data || data == [] ) result['data'] = data; 

     if(extra)  Object.assign(result,extra); 

     return result;
    },
  
    failed: (message) => {
        return {
            status_code: "0",
            status_text: "failed",
            message: message,
        }
    },

    unauth: () => {
        return {
            status_code: "0",
            status_text: "failed",
            message: 'Unauthenticated',
        }
    },

    notfound: () => {
        return {
            status_code: "0",
            status_text: "failed",
            message: 'Not Found',
        }
    },

    groupBy: (key , array) => {
        var result = {};
        array.forEach(element => {
            if(result[element[key]] !== undefined)
            {
                result[element[key]].push(element);
            }
            else
            {
                result[element[key]] = [element];
            }
        });
        return result;
    },

    limitGroupBy: (key , array , limit) => {
        var result = {};
        array.every(element => {
            if(Object.keys(result).length == limit) {
                return false;
            }
            if(result[element[key]] !== undefined)
            {
                result[element[key]].push(element);
            }
            else
            {
                result[element[key]] = [element];
            }
            return true;
        });
        return result;
    },

    paginate: (page , array_data , per_page, total_count) => {
        const reminder = total_count % per_page ;
        const total_page = parseInt(total_count / per_page ); 
        const last_page = reminder != 0 ? total_page + 1 : total_page ;
       return {
            current_page: page,
            data: array_data,
            from: (array_data.length != 0)  ? 1 : null,
            to:   (array_data.length != 0 ) ? array_data.length : null,
            last_page: last_page,
            per_page: per_page,
            total: total_count
        };
        
    },

    firstError:(validation) =>{
        let first_key = Object.keys(validation.errors.errors)[0];	
        return validation.errors.first(first_key);	

    },
    send: (to, message) => {
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure:true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS, // sender address
            to: to, // list of receivers
            subject: 'Test', // Subject line
            text: message, // plain text body
            html: '<b>'+message+'</b>' // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    }
};
