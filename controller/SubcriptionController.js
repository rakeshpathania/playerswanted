import Subscription from "../models/Subscription.js";
import Validator from "validatorjs";
import reply from "../helper/reply.js";
import InstSubscription from "../models/InstSubscription.js";

export default {
  async createSubscription(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      instructor_id: "required",
      game_id: "required",
      package_amount: "required",
      package_duration: "required",
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    const today = new Date();
    const expired_at = new Date(
      today.getTime() + (request.package_duration) * 24 * 60 * 60 * 1000
    );
    
    const dt = Date.parse(expired_at);
    let expire = dt / 1000;
   
    let subscription_data = {
      instructor_id: request.instructor_id,
      game_id: request.game_id,
      user_id: request.user_id,
      package_amount: request.package_amount,
      package_duration: request.package_duration,
      expired_at: expire,
    };

    let existSub = await Subscription.findOne({
      where: {
        user_id: request.user_id,
        instructor_id: request.instructor_id,
        game_id: request.game_id,
      },
    });

    if (existSub) {
      existSub.package_amount = request.package_amount;
      existSub.package_duration = request.package_duration;
      existSub.expired_at = expire;
      existSub.save();
    } else {
      await Subscription.create(subscription_data);
    }

    return res.json(
      reply.success("Subsciption created successfully", subscription_data)
    );
  },

  async createInstSubscription(req, res) {
    let request = req.body;

    let validation = new Validator(request, {
      instructor_id: "required",
      package_amount: "required"
    });

    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }

    const today = new Date();
    const expired_at = new Date(
      today.getTime() + (30) * 24 * 60 * 60 * 1000
    );
    
    const dt = Date.parse(expired_at);
    let expire = dt / 1000;
   
    let subscription_data = {
      instructor_id: request.instructor_id,
      package_amount: request.package_amount,
      package_duration: 30,
      expired_at: expire,
    };
    await InstSubscription.create(subscription_data);
  
    return res.json(
      reply.success("Subsciption created successfully", subscription_data)
    );
  },
};
