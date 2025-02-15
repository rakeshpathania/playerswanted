import User from "../models/users.js";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import reply from "../helper/reply.js";
import crypto from "crypto";
import ForgetToken from "../models/ForgetToken.js";
import Sport from "../models/Sport.js";
import helper from "../helper/helpers.js";
import Payment from "../models/Payment.js";
import Stripe from "stripe";
import dotenv from "dotenv";

async function rules(user) {
  console.log();
  let rule = {
    name: "required",
    username: "required",
    age: "required",
    gender: "required",
    email: "required|email",
    password:
      "required|min:8|max:18|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/",
    phone_number: "required|numeric",
    role: "required",
    address: "required",
  };
  if (user.role == "2") {
    // rule.game = 'required',
    // rule.level = 'required'
  }
  return rule;
}

async function getTime(data) {
  let date = new Date(data);
  // Hours part from the timestamp
  let hours = date.getHours();
  // Minutes part from the timestamp
  let minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  let seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  return hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
}

async function randomString(size) {
  return crypto.randomBytes(size).toString("base64").slice(0, size);
}
async function addSport(sportData, user_id) {
  let request = sportData;

  let validation = new Validator(request, {
    "sportData.*.game_id": "required",
    "sportData.*.level": "required",
  });
  if (validation.fails()) {
    return res.json(reply.failed(reply.firstError(validation)));
  }

  let data = JSON.parse(request);

  const newArr = data.map((val) => {
    let obj = {
      ...val,
      user_id: user_id,
      status: 1,
    };
    return obj;
  });

  if (data.length == 0) {
    return reply.failed("You didn't add any sports");
  } else {
    return await Sport.bulkCreate(newArr);
  }
}
export default {
  async userSignup(req, res) {
    let request = req.body;

    console.log(request);
    let image = "";
    let user = {
      name: request.name,
      username: request.username,
      age: request.age,
      gender: request.gender,
      email: request.email,
      password: request.password,
      phone_number: request.phone_number,
      role: request.role,
      location: request.location,
      address: request.address,
      image,
      latitude: request.latitude,
      longitude: request.longitude
    };

    let rule = await rules(user);

    let validation = new Validator(request, rule);

    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    //check if mail is exist...
    const find_exist_user = await User.findOne({
      where: {
        email: user.email,
      },
    });

    if (find_exist_user) {
      return res.json(reply.failed("this email is already exist"));
    }

    //check for same mobile number....
    const find_exist_phone = await User.findOne({
      where: {
        phone_number: user.phone_number,
      },
    });
    if (find_exist_phone) {
      return res.json(reply.failed("this phone number is already exist"));
    }

    const salt = await bcrypt.genSalt(10);

    const hashedpassword = await bcrypt.hash(user.password, salt);

    user.password = hashedpassword;
    var auth_create = await randomString(20);

    user.auth_key = auth_create;

    if (req.files && req.files.image) {
      image = helper.fileUpload(req.files.image, "images");
      user.image = image;
    }

    let register_user = await User.create(user);

    await addSport(request.sportData, register_user.id);

    let session = (req.session.users = register_user);

    return res.json(reply.success("Sign Up Successfully", session));
  },
  async userLogin(req, res) {
    try {
      var request = req.body;
      var email = request.email;
      var password = request.password;

      let validation = new Validator(request, {
        email: "required|email",
        password: "required",
      });
      if (validation.fails()) {
        return res.json(reply.failed(reply.firstError(validation)));
      }
 
      const user = await User.findOne({
        where: {
          email: email,
          type: "1"
        },
      });

      if (!user) {
        return res.json(reply.failed("User not found"));
      }

      const pass_wrd = await bcrypt.compare(password, user.password);

      if (user && pass_wrd) {
        let session = (req.session.users = user);
        return res.json(reply.success("User login Successfully", session));
      } else {
        return res.json(reply.failed("Invalid login credentials"));
      }
    } catch (err) {
      // req.flash('error_msg', err);
      return res.sendStatus(403);
    }
  },
  //forget password....
  async forgetPassword(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      email: "required|email",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let existance = await User.findOne({
      where: {
        email: request.email,
      },
    });

    if (!existance) {
      return res.json(reply.failed("This email is not registered"));
    }

    let token = await randomString(10);

    let current_time = new Date().setMinutes(new Date().getMinutes() + 5);

    let expired_at = await getTime(current_time);

    let data = {
      email: existance.email,
      user_id: existance.id,
      token: token,
      expired_at: expired_at,
    };

    let update_token = await ForgetToken.findOne({
      where: {
        email: data.email,
      },
    });

    if (!update_token) {
      await ForgetToken.create(data);
    } else {
      update_token.email = data.email;
      update_token.user_id = data.user_id;
      update_token.token = data.token;
      update_token.expired_at = data.expired_at;

      update_token.save();
    }

    let url = `${req.protocol}://${req.get(
      "host"
    )}/resetpassword?token=${token}`;

    reply.send(data.email, "Click on this link to reset your passowrd  " + url);

    return res.json(
      reply.success(
        "mail has successfully sent on this mail id " + data.email,
        data
      )
    );
  },
  //reset password...
  async resetPassword(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      password:
        "required|min:8|max:18|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/|same:confirm_password",
      token: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }
    let user = await ForgetToken.findOne({
      where: {
        token: request.token,
      }
    });
    if (!user) {
      return res.json(
        reply.failed("You are not authorised to change the password")
      );
    }

    // let current_ts = new Date().getTime();
    // let current_time = await getTime(current_ts);

    // if (current_time > user.expired_at) {
    //     return res.json(reply.failed("Your session is expired"));

    // }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(request.password, salt);
    let password = hashedpassword;

    let new_password = await User.update(
      { password },
      {
        where: { email: user.email },
      }
    );

    if (!new_password) {
      return res.json(
        reply.failed(
          "There is some issue with change password please try after some time"
        )
      );
    }
    // req.flash('success_msg', 'Your Password Has Changed Successfully');
    return res.json(reply.success("Your Password Has Changed Successfully"));
  },

  //User existance with same mail id......
  async getuserEmail(req, res) {
    let request = req.query;
    if (!request.email) {
      return res.json(reply.failed("Email not found"));
    }
    let user = await User.findOne({
      where: {
        email: request.email,
      },
    });
    return user ? res.json(false) : res.json(true);
  },
  //User existance with same phone number.....
  async getuserPhone(req, res) {
    let request = req.query;
    if (!request.phone_number) {
      return res.json(reply.failed("Phone number is not found"));
    }
    let user = await User.findOne({
      where: {
        phone_number: request.phone_number,
      },
    });
    return user ? res.json(false) : res.json(true);
  },

  /////////SAME CARD NUMBER ///////////
  async getUserCard(req, res) {
    let request = req.query;
    if (!request.cardnumber) {
      return res.json(reply.failed("Card number is not found"));
    }
    let card = await Payment.findOne({
      where: {
        card_number: request.cardnumber,
      },
    });

    return card ? res.json(false) : res.json(true);
  },

  //User Logout....
  async userLogout(req, res) {
    let session = req.session;
    // req.flash('success_msg', 'User Logout Successfully');
    let destroySession = session.destroy();
    if (destroySession) {
      return res.json(reply.success("User Logout Successfully"));
    } else {
      return res.json(reply.failed("server Error!!!"));
    }
  },
};
