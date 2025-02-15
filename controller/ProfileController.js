import User from "../models/users.js";
import Validator from "validatorjs";
import reply from "../helper/reply.js";
import bcrypt from "bcryptjs";
import Payment from "../models/Payment.js";
import Sport from "../models/Sport.js";
import helper from "../helper/helpers.js";
import Lesson from "../models/Lesson.js";
import Package from "../models/Package.js";
import Rate from "../models/Rate.js";
import StripeKey from "../models/StripeIds.js";
import AverageRate from "../models/AverageRate.js";
import fs from "fs";

async function comparePass(req, res, password) {
  let user = await User.findOne({
    where: {
      id: req.session.users?.id,
    },
  });
  if (!user) {
    return false;
  }
  const pass_wrd = await bcrypt.compare(password, user.password);

  return pass_wrd ? true : false;
}

export default {
  ///////UPDATE PROFILE////////////
  async updateProfile(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      name: "required",
      phone_number: "required|numeric",
    });
    if (validation.fails())
      return res.json(reply.failed(reply.firstError(validation)));

    let data = {
      name: request.name,
      email: request.email,
      phone_number: request.phone_number,
    };

    req.session.users.name = request.name;
    req.session.users.email = request.email;
    req.session.users.phone_number = request.phone_number;

    await User.update(data, { where: { id: req.session.users?.id } });
    return res.json(reply.success("profile updated successfully"));
  },

  ///////UPDATE PROFILE////////////
  async updateProfilePhoto(req, res) {
    let image = req.files?.image;

    if (req.files && image) {
      image = helper.fileUpload(image, "images");
    }
    let data = {
      image,
    };

    let user = await User.findOne({
      where: {
        id: req.session?.users?.id,
      },
    });

    if (user && user.image != "") {
      fs.unlink(process.cwd() + "/public/images/" + user?.image, (err) => {
        if (err) {
          return res.json(reply.failed("Failed to upload"));
        }

        console.log("Delete File successfully.");
      });
    }

    await User.update(data, { where: { id: req.session.users?.id } });
    req.session.users.image = image;

    return res.json(reply.success("profile Photo updated successfully"));
  },

  ///////UPDATE INSTRUCTOR PROFILE////////////

  async updateInsructorProfile(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      name: "required",
      phone_number: "required|numeric",
      username: "required",
      location: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let data = {
      name: request.name,
      phone_number: request.phone_number,
      username: request.username,
      location: request.location,
    };

    req.session.users.name = request.name;
    req.session.users.email = request.email;
    req.session.users.phone_number = request.phone_number;
    req.session.users.username = request.username;
    req.session.users.location = request.location;

    await User.update(data, { where: { id: req.session.users?.id } });
    return res.json(reply.success("profile updated successfully"));
  },

  ///////UPDATE INSTRUCTOR SPORT////////////
  async updateSport(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      game_id: "required",
      level: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let sport = {
      user_id: req.session.users?.id,
      game_id: request.game_id,
      levels: request.level,
      status: 1,
    };

    let certificate = helper.fileUpload(req.files.certificate, "certificates");

    sport.certificate = certificate;

    await Sport.create(sport);
    return res.json(reply.success("Sports updated succcessfully"));
  },

  /////// ADD LESSON ////////////

  async addLesson(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      title: "required",
      description: "required",
      game: "required",
      type: "required",
      url: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let lesson = {
      instructor_id: req.session.users?.id,
      title: request.title,
      description: request.description,
      status: 1,
      game_id: request.game,
      type: request.type,
      url: request.url,
    };

    await Lesson.create(lesson);
    return res.json(reply.success("Your lesson added succcessfully"));
  },

  ///////UPDATE PASSWORD////////////
  async updatePassword(req, res) {
    console.log({ e: req.session.users });
    let request = req.body;

    let validation = new Validator(request, {
      old_password: "required",
      new_password:
        "required|min:8|max:18|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/|same:confirm_password",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let comparePassword = await comparePass(req, res, request.old_password);
    if (!comparePassword) {
      return res.json(reply.failed("You entered the wrong password"));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(request.new_password, salt);
    let password = hashedpassword;

    await User.update(
      {
        password: password,
      },
      {
        where: {
          id: req.session.users?.id,
        },
      }
    );

    return res.json(reply.success("Password updated successfully"));
  },

  ////// ADD SPORT /////////
  async addSport(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      game_id: "required",
      per_month: "required",
      per_halfyear: "required",
      per_year: "required",
      experience: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    request.instructor_id = req.session.users?.id;

    let sport_data = {
      user_id: request.instructor_id,
      levels: request.experience,
      status: 1,
      game_id: request.game_id,
    };

    await Sport.create(sport_data);
    await Package.create(request);

    return res.json(reply.success("Your sport is added successfully"));
  },

  ///////////DELETE SPORT/////////////
  async dltSport(req, res) {
    let request = req.body;
    let dlt_sport = await Sport.destroy({
      where: {
        id: request.id,
      },
    });
    return dlt_sport
      ? res.json(reply.success("Sport deleted successfully"))
      : res.json(reply.failed("Server issue!!!"));
  },

  ///////////DELETE LESSON/////////////
  async dltLesson(req, res) {
    let request = req.body;

    let dlt_lesson = await Lesson.destroy({
      where: {
        id: request.id,
      },
    });
    return dlt_lesson
      ? res.json(reply.success("Lesson deleted successfully"))
      : res.json(reply.failed("Server issue!!!"));
  },
  ////////UPDATE PACKAGE/////////
  async updatePackage(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      game_id: "required",
      per_month: "required",
      per_halfyear: "required",
      per_year: "required",
      experience: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let data = {
      instructor_id: req.session.users.id,
      experience: request.experience,
      game_id: request.game_id,
      per_month: request.per_month,
      per_halfyear: request.per_halfyear,
      per_year: request.per_year,
    };

    await Package.update(data, {
      where: {
        id: req.query.id,
      },
    });
    return res.json(reply.success("Package updated successfully"));
  },
  //////PASSWORD COMPARE/////////
  async passwordCompare(req, res) {
    let request = req.query;
    return res.json(await comparePass(req, res, request.oldpassword));
  },

  /////////ADD CARD DETAILS///////
  async cardDetails(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      name_on_card: "required",
      name: "required",
      card_number: "required|max:18",
      expiry: "required",
      cvv: "required",
    });

    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let payment_details = {
      name_on_card: request.name_on_card,
      name: request.name,
      card_number: request.card_number,
      expiry: request.expiry,
      cvv: request.cvv,
      user_id: req.session.users?.id,
    };

    await Payment.create(payment_details);
    return res.json(reply.success("Your payment method added successfully"));
  },

  /////////ADD STRIPE DETAILS///////
  async addStripeDetail(req,res){
    let request = req.body;

    let validation = new Validator(request, {
      stripe_key: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    await StripeKey.create({
      user_id: req.session.users?.id,
      secret_key: request.stripe_key
    });
    return res.json(reply.success("Your stripe detail added successfully"));
  },

  ///////////DELETE CARD DETAILS/////////////
  async dltCard(req, res) {
    try {
      let request = req.body;
      await Payment.destroy({
        where: {
          id: request.id,
        },
      });
      return res.json(reply.success("Card details deleted successfully"));
    } catch (err) {
      console.log(err);
      return res.json(reply.failed(err));
    }
  },
  //////////////RATING//////////////////
  async createRate(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      rate_to: "required",
      rate: "required|numeric",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let data = {
      rate_to: request.rate_to,
      rate_from: req.session.users?.id,
      rate: request.rate,
      review: request.review,
      status: 1,
    };

    let rating = await Rate.findOne({
      where: {
        rate_to: request.rate_to,
        rate_from: req.session.users?.id,
      },
    });

    if (!rating) {
      await Rate.create(data);
    } else {
      rating.rate = data.rate;
      rating.review = data.review;
      rating.save();
    }

    return res.json(reply.success("Your rate is done successfully"));
  },

  //////////////UPDATE PACKAGE//////////////////
  async updatePackage(req, res) {
    let request = req.body;
    let validation = new Validator(request, {
      per_month: "required",
      per_halfyear: "required",
      per_year: "required",
      game_id: "required",
      experience: "required",
    });

    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    let packages = await Package.findOne({
      where: {
        instructor_id: req.session.users?.id,
        game_id: request.game_id,
      },
    });
    if (!packages) {
      let data = {
        game_id: request.game_id,
        instructor_id: req.session.users?.id,
        per_month: request.per_month,
        per_halfyear: request.per_halfyear,
        per_year: request.per_year,
        experience: request.experience,
      };

      await Package.create(data);
    } else {
      packages.per_month = request.per_month;
      packages.per_halfyear = request.per_halfyear;
      packages.per_year = request.per_year;
      packages.experience = request.experience;

      await packages.save();
    }
    return res.json(reply.success("Your packages are updated successfully"));
  },

  async switchProfile(req, res) {
    let login_user = req.session.users;
    let player;
    if (login_user.role == "1") {
      
      player = await User.update(
        { role: "2" },
        {
          where: {
            id: req.session.users.id,
          },
        }
      );
      let user = await User.findOne({
        where: {
          id: req.session.users.id,
        },
      });
  
      req.session.users = user;
  
      return player
        ? res.json(reply.success("Profile switched to instructor successfully"))
        : res.json(reply.failed("Server Issue!!!!"));
    }else{
      player = await User.update(
        { role: "1" },
        {
          where: {
            id: req.session.users.id,
          },
        }
      );
      let user = await User.findOne({
        where: {
          id: req.session.users.id,
        },
      });
  
      req.session.users = user;
  
      return player
        ? res.json(reply.success("Profile switched to player successfully"))
        : res.json(reply.failed("Server Issue!!!!"));
    }

   
  },
};
