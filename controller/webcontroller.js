import User from "../models/users.js";
import Sport from "../models/Sport.js";
import Game from "../models/Game.js";
import Payment from "../models/Payment.js";
import Lesson from "../models/Lesson.js";
import Package from "../models/Package.js";
import sequelize from "sequelize";
import Chat from "../models/Chat.js";
import _ from "lodash";
import Rate from "../models/Rate.js";
import exactMath from "exact-math";
import AverageRate from "../models/AverageRate.js";
import Video from "../models/Video.js";
import Subscription from "../models/Subscription.js";
import ChatTimimg from "../models/ChatTiming.js";
import InstSubscription from "../models/InstSubscription.js";
import Sequelize from "sequelize";
import StripeDetail from "../models/StripeDetail.js";
import Stripe from "stripe";
import config from "../config/Stripe.js";
import httpBuildQuery from "http-build-query";
const stripe = Stripe(config.secretKey);

const MathConfig = { returnString: true, eMinus: Infinity, ePlus: Infinity };

const { Op } = sequelize;

let uniqueID;
let title;

async function getToken(code) {
  let token = {};
  try {
    token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
  } catch (error) {
    token.error = error.message;
  }
  return token;
}

async function getAccount(connectedAccountId) {
  let account = {};
  try {
    account = await stripe.account.retrieve(connectedAccountId);
  } catch (error) {
    account.error = error.message;
  }
  return account;
}

//get average rating.....
async function getAverageRate(id) {
  let rating = await Rate.findAll({
    where: {
      rate_to: id,
    },
  });
  if (rating.length != 0) {
    let sum = 0;
    rating.forEach((val) => {
      sum = exactMath.add(sum, val.rate, MathConfig);
    });

    let averageRate = exactMath.div(sum, rating.length, MathConfig);

    console.log(sum);

    let getaverageRate = await AverageRate.findOne({
      where: {
        user_id: id,
      },
    });

    if (!getaverageRate) {
      await AverageRate.create({
        user_id: id,
        rate: averageRate,
        status: 1,
      });
    } else {
      getaverageRate.rate = averageRate;
      await getaverageRate.save();
    }
  }
}

async function getInstructor() {
  let instructors = await User.findAll({
    where: {
      role: "2",
    },
    include: [
      {
        model: Sport,

        include: [
          {
            model: Game,
          },
        ],
      },
      {
        model: AverageRate,
      },
    ],
  });

  instructors.forEach(async (val) => {
    await getAverageRate(val.id);
  });
  return instructors;
}

async function allUser(req, res, search_user) {
  let condition = {
    where: {
      id: {
        [Op.ne]: req.session.users?.id,
      },
    },

    include: [{ model: AverageRate }, { model: ChatTimimg }],
  };

  if (search_user != "" && search_user != undefined) {
    console.log(search_user);
    condition.where.name = { [Op.substring]: search_user };
  }

  let users = await User.findAll(condition);
  return users;
}

export default {
  index: async (req, res) => {
    try {
      const title = "home";

      // Construct base condition
      const condition = {
        where: {
          role: 2, // Ensuring integer comparison
        },
        include: [
          {
            model: Sport,
            include: [{ model: Game }],
          },
          {
            model: AverageRate,
            required: false,
          },
        ],
      };

      // Fetch Nearby Users
      const userLocation = req.session.users?.location || "160059";
      const nearBy = await User.findAll({
        where: {
          location: userLocation,
          role: 1,
        },
      });

      // Apply Filters
      if (req.query.rate) {
        condition.include[1].where = {
          rate: { [Op.gte]: Number(req.query.rate) },
        };
        condition.include[1].required = true;
      }

      if (req.query.exp) {
        condition.include[0].where = { levels: req.query.exp };
      }

      if (req.query.gender) {
        condition.where.gender = req.query.gender;
      }

      if (req.query.age) {
        const ageRange = req.query.age.split(",").map(Number);
        condition.where.age = { [Op.between]: ageRange };
      }

      // Fetch Games
      const [allgames, sportsOffered, game_length, instructors] =
        await Promise.all([
          Game.findAll({ raw: true }),
          req.query.view_more === "true"
            ? Game.findAll()
            : Game.findAll({ offset: 0, limit: 4 }),
          Game.findAll(),
          User.findAll(condition),
        ]);

      // Fetch Average Rate for Each Instructor
      await Promise.all(instructors.map(async (val) => getAverageRate(val.id)));

      // Render Response
      res.render("web/index", {
        session: req.session,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        instructors,
        sportsOffered,
        allgames,
        title,
        nearBy,
        game_length,
      });
    } catch (error) {
      console.log(error, ">>>>>")
      res.status(500).send("Internal Server Error");
    }
  },
  register: async (req, res) => {
    let games = await Game.findAll({ raw: true });
    title = "home";
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();
    res.render("web/register", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      games,
      instructors,
      title,
      allgames,
    });
  },
  resetpassword: async (req, res) => {
    let instructors = await getInstructor();
    title = "reset";
    let allgames = await Game.findAll({ raw: true });

    res.render("web/reset_password", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      token: req.query.token,
      instructors,
      title,
      allgames,
    });
  },
  about: async (req, res) => {
    let instructors = await getInstructor();
    title = "about";
    let allgames = await Game.findAll({ raw: true });

    res.render("web/about", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
    });
  },
  home: async (req, res) => {
    let condition;
    title = "home";
    condition = {
      where: {
        role: "2",
      },
      include: [
        {
          model: Sport,
          where: {},
          include: [
            {
              model: Game,
            },
          ],
        },
        {
          model: AverageRate,
          where: {},
          required: false,
        },
      ],
    };

    let nearBy = await User.findAll({
      where: {
        location: req.session.users ? req.session.users.location : "160059",
        role: "1",
      },
    });

    if (req.query.rate) {
      condition.include[1].where.rate = { [Op.gte]: req.query.rate };
      condition.include[1].required = true;
    }

    if (req.query.exp) {
      condition.include[0].where.levels = req.query.exp;
    }

    if (req.query.gender) {
      condition.where.gender = req.query.gender;
    }

    if (req.query.age) {
      var a = req.query.age;
      var array = a.split(",");
      condition.where.age = { [Op.between]: array };
    }

    let sportsOffered = [];

    let game_length = await Game.findAll();

    if (req.query.view_more == "true") {
      sportsOffered = await Game.findAll();
    } else {
      sportsOffered = await Game.findAll({
        offset: 0,
        limit: 4,
      });
    }

    let allgames = await Game.findAll({ raw: true });
    console.log({ allgames });
    let instructors = await User.findAll(condition);

    instructors.forEach(async (val) => {
      await getAverageRate(val.id);
    });

    res.render("web/home", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      sportsOffered,
      allgames,
      title,
      nearBy,
      game_length,
    });
  },
  store: async (req, res) => {
    title = "store";
    let instructors = await getInstructor();
    let allgames = await Game.findAll({ raw: true });

    res.render("web/store", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
    });
  },
  myaccount: async (req, res) => {
    title = "myaccount";
    let user = await User.findOne({
      where: {
        id: req.session?.users.id,
      },
      raw: true,
    });

    let games = await Sport.findAll({
      where: {
        user_id: req.session?.users.id,
      },
      include: [
        {
          model: Game,
          required: true,
        },
        {
          model: Package,
          where: {
            instructor_id: req.session.users?.id,
          },
          required: false,
        },
      ],
      distinct: true,
    });

    console.log(games);
    // return res.send(games)
    let ids = [];
    games.forEach((element) => {
      ids.push(element.game_id);
    });

    let payment = await Payment.findAll({
      where: {
        user_id: req.session?.users?.id,
      },
      raw: true,
    });
    let lessons = await Lesson.findAll({
      where: {
        instructor_id: req.session.users?.id,
      },
      include: [
        {
          model: Game,
          as: "game",
        },
      ],
    });

    let game = await Game.findAll({
      where: {
        id: {
          [Op.notIn]: ids,
        },
      },
      raw: true,
    });
    let allgames = await Game.findAll({ raw: true });

    let lessonGame = await Game.findAll({ raw: true });
    console.log(allgames);

    let today = new Date();
    let expired_at = new Date(new Date().setDate(today.getDate()));

    const dt = Date.parse(expired_at);
    let todayDt = dt / 1000;

    let subscription = await Subscription.findAll({
      where: {
        user_id: req.session?.users?.id,
        expired_at: { [Op.gt]: [todayDt] },
      },
      include: [
        {
          model: Game,
        },
      ],
    });

    let instSub = await InstSubscription.findOne({
      where: {
        instructor_id: req.session?.users?.id,
        expired_at: { [Op.gt]: [todayDt] },
      },
    });

    let stripe_detail = await StripeDetail.findOne({
      where: {
        user_id: req.session.users?.id,
      },
    });

    let queryData = {
      response_type: "code",
      client_id: config.clientId,
  
      scope: "read_write",
      redirect_uri: config.redirectUri,
    };
    let connectUri = config.authorizationUri + "?" + httpBuildQuery(queryData);
    if (req.query.code) {
      const token = await getToken(req.query.code);

      const connectedAccountId = token.stripe_user_id;
      let account = await getAccount(connectedAccountId);
      if (!stripe_detail) {
        await StripeDetail.create({
          user_id: req.session.users.id,
          acc_id: account.id,
        });
        res.redirect(req.originalUrl.split("?")[0]);
      }
    }

    let instructors = await getInstructor();
    if (user.role == "1") {
      res.render("web/myaccount", {
        session: req.session,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        user,
        games,
        payment,
        instructors,
        game,
        allgames,
        lessons,
        title,
        subscription,
        todayDt,
      });
    } else {
      res.render("web/instructor_account", {
        session: req.session,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        user,
        games,
        payment,
        instructors,
        game,
        allgames,
        lessons,
        lessonGame,
        title,
        instSub,
        stripe_detail,
        code: req.query.code,
        connectUri,
      });
    }
  },
  sportsoffered: async (req, res) => {
    let condition;
    title = "sportsoffered";
    condition = {
      where: {
        role: "2",
      },
      include: [
        {
          model: Sport,
          where: {},
          include: [
            {
              model: Game,
            },
          ],
        },
        {
          model: AverageRate,
          where: {},
          required: false,
        },
      ],
    };

    let nearBy = await User.findAll({
      where: {
        location: req.session.users ? req.session.users.location : "160059",
        role: "1",
      },
    });

    if (req.query.rate) {
      condition.include[1].where.rate = { [Op.gte]: req.query.rate };
      condition.include[1].required = true;
    }

    if (req.query.exp) {
      condition.include[0].where.levels = req.query.exp;
    }

    if (req.query.gender) {
      condition.where.gender = req.query.gender;
    }

    if (req.query.age) {
      var a = req.query.age;
      var array = a.split(",");
      condition.where.age = { [Op.between]: array };
    }

    let sportsOffered = [];

    let game_length = await Game.findAll();

    if (req.query.view_more == "true") {
      sportsOffered = await Game.findAll();
    } else {
      sportsOffered = await Game.findAll({
        offset: 0,
        limit: 4,
      });
    }

    let allgames = await Game.findAll({ raw: true });
    console.log({ allgames });
    let instructors = await User.findAll(condition);

    instructors.forEach(async (val) => {
      await getAverageRate(val.id);
    });

    res.render("web/Sportsoffered", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      sportsOffered,
      allgames,
      title,
      nearBy,
      game_length,
    });
  },
  sportsofferedtwo: async (req, res) => {
    let instructors = await getInstructor();
    title = "home";
    uniqueID = req.query.id;
    let perticular_game = await Game.findOne({
      where: {
        id: req.query.id,
      },
      raw: true,
    });
    let allgames = await Game.findAll({ raw: true });

    let condition = {
      where: {
        game_id: req.query.id,
      },
      include: [
        {
          model: Game,
        },
        {
          model: User,
          where: {},
          as: "user_detail",
          include: [
            {
              model: Package,
              where: {
                game_id: req.query.id,
              },
              order: [],
            },
            {
              model: AverageRate,
              where: {},
              required: false,
            },
          ],
        },
      ],
    };
    console.log(req.query, ">>>>>>query>>>>>>>>>>")
    if (req.query.rate) {
      condition.include[1].include[1].where.rate = { [Op.gte]: req.query.rate };
      condition.include[1].include[1].required = true;
    }
    if (req.query.dur && req.query.ord) {
      condition.include[1].include[0].order[0] = [req.query.dur, req.query.ord];
    }
    if (req.query.exp) {
      condition.where.levels = req.query.exp;
    }
    if (req.query.gender) {
      condition.include[1].where.gender = req.query.gender;
    }
    if (req.query.age) {
      var a = req.query.age;
      var array = a.split(",");
      condition.include[1].where.age = { [Op.between]: array };
    }

    console.log(condition, "condition>>>>>>>>>>>>>>")
    let sport = await Sport.findAll(condition);
    console.log(sport, "sport>>>>>>>>>")
    let usrs = [];
    sport?.forEach((val) => {
      val.user_detail.forEach(async (element) => {
        usrs.push(element);
        await getAverageRate(element.id);
      });
    });

    res.render("web/Sports_offered_two", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      sport,
      perticular_game,
      instructors,
      uniqueID,
      title,
      allgames,
      usrs,
    });
  },
  contactinstructor: async (req, res) => {
    let allgames = await Game.findAll({ raw: true });
    title = "contactinstructor";
    let instructors = await getInstructor();

    let nearBy = await User.findAll({
      where: {
        location: req.session.users ? req.session.users.location : "160059",
        role: "1",
      },
    });
    res.render("web/contactinstructor", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
      nearBy,
    });
  },
  videos: async (req, res) => {
    let instructors = await getInstructor();
    let videos = await Video.findAll();
    title = "video";
    let allgames = await Game.findAll({ raw: true });

    if (req.query.inst_id && req.query.game_id && req.session.users) {
      videos = await Lesson.findAll({
        where: {
          instructor_id: req.query.inst_id,
          game_id: req.query.game_id,
        },
      });
      console.log(videos);
      res.render("web/videos", {
        videos,
        session: req.session,
        instructors,
        title,
        allgames,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
      });
    } else {
      res.render("web/videos", {
        videos,
        session: req.session,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        instructors,
        title,
        allgames,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
      });
    }
  },
  booknow: async (req, res) => {
    let instructors = await getInstructor();
    title = "booknow";
    let request = req.query;
    let allgames = await Game.findAll({ raw: true });
    let packages = await Package.findOne({
      where: {
        instructor_id: request.user_id,
        game_id: request.game_id,
      },
    });
    console.log(packages);
    let user_id = request.user_id;
    let game_id = request.game_id;

    let today = new Date();
    let expired_at = new Date(new Date().setDate(today.getDate()));

    const dt = Date.parse(expired_at);
    let todayDt = dt / 1000;

    let subscription = await Subscription.findAll({
      where: {
        instructor_id: user_id,
        user_id: req.session.users?.id,
        game_id: game_id,
        expired_at: { [Op.gt]: [todayDt] },
      },
    });
    res.render("web/booknow", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      packages,
      title,
      user_id,
      game_id,
      allgames,
      subscription,
    });
  },
  lessons: async (req, res) => {
    let instructors = await getInstructor();
    let allgames = await Game.findAll({ raw: true });
    res.render("web/lessons", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      allgames,
    });
  },
  buddy: async (req, res) => {
    title = "buddy";
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();

    let user_detail = await User.findOne({
      where: {
        id: req.session?.users?.id,
      },
      attributes: ["latitude", "longitude"],
    });

    const givenLatitude = user_detail.latitude; // given latitude
    const givenLongitude = user_detail.longitude; // given longitude
    const radius = 6371.01; // radius of the Earth in kilometers
    const distance = 8.04672; // distance in kilometers

    const condition = {
      attributes: [
        "id",
        "name",
        "latitude",
        "longitude",
        "image",
        [
          Sequelize.literal(
            `${radius} * acos(cos(radians(${givenLatitude})) * cos(radians(latitude)) * cos(radians(${givenLongitude}) - radians(longitude)) + sin(radians(${givenLatitude})) * sin(radians(latitude)))`
          ),
          "distance",
        ],
      ],
      where: Sequelize.and(
        Sequelize.literal(
          `${radius} * acos(cos(radians(${givenLatitude})) * cos(radians(latitude)) * cos(radians(${givenLongitude}) - radians(longitude)) + sin(radians(${givenLatitude})) * sin(radians(latitude))) < ${distance}`
        ),
        {
          id: { [Op.ne]: req.session.users?.id },
          role: "1",
        }
      ),
      include: [{ model: AverageRate }],
      order: Sequelize.col("distance"),
    };

    if (req.query.game) {
      condition = {
        where: {
          id: {
            [Op.notIn]: [req.session?.users?.id],
          },
          role: "1",
        },
        include: [
          {
            model: Sport,
            where: {
              game_id: req.query.game,
            },
            include: [
              {
                model: Game,
                where: {
                  id: req.query.game,
                },
                required: true,
              },
            ],
            required: true,
          },
          {
            model: AverageRate,
          },
        ],
      };
    }

    if (req.query.rate) {
      if (req.query.game) {
        condition.include[1].where = { rate: { [Op.gte]: [req.query.rate] } };
      } else {
        condition.include[0].where = { rate: { [Op.gte]: [req.query.rate] } };
      }
    }

    if (req.query.exp) {
      condition.include[1] = { model: Sport, where: { levels: req.query.exp } };
    }

    if (req.query.loc) {
      condition.where.location = req.query.loc;
    }

    if (req.query.gender) {
      condition.where.gender = req.query.gender;
    }

    if (req.query.age) {
      let a = req.query.age;
      let array = a.split(",");
      condition.where.age = { [Op.between]: array };
    }

    let users = await User.findAll(condition);

    res.render("web/buddy", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      users,
      title,
      allgames,
    });
  },
  buddyMap: async (req, res) => {
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();
    title = "buddymap";
    let users = await allUser(req, res);

    let user_detail = await User.findOne({
      where: {
        id: req.session?.users?.id,
      },
      attributes: ["latitude", "longitude"],
    });

    const givenLatitude = user_detail.latitude; // given latitude
    const givenLongitude = user_detail.longitude; // given longitude
    const radius = 6371.01; // radius of the Earth in kilometers
    const distance = 8.04672; // distance in kilometers
    let nearBy = await User.findAll({
      attributes: [
        "id",
        "name",
        "latitude",
        "longitude",
        "image",
        [
          Sequelize.literal(
            `${radius} * acos(cos(radians(${givenLatitude})) * cos(radians(latitude)) * cos(radians(${givenLongitude}) - radians(longitude)) + sin(radians(${givenLatitude})) * sin(radians(latitude)))`
          ),
          "distance",
        ],
      ],
      where: Sequelize.and(
        Sequelize.literal(
          `${radius} * acos(cos(radians(${givenLatitude})) * cos(radians(latitude)) * cos(radians(${givenLongitude}) - radians(longitude)) + sin(radians(${givenLatitude})) * sin(radians(latitude))) < ${distance}`
        ),
        {
          id: { [Op.ne]: req.session.users?.id },
          role: "1",
        }
      ),
    });

    console.log("nearBy>>>>>>>>>>>>>", nearBy);

    res.render("web/buddy_map", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      users,
      title,
      allgames,
      nearBy,
    });
  },
  detail: async (req, res) => {
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();
    title = "home";
    let user = await User.findOne({
      where: {
        id: req.query.id,
      },
      include: [
        {
          model: Package,
          where: {
            game_id: req.query.game_id,
          },
        },
      ],
    });

    let today = Date.now();

    let subscription = await Subscription.findOne({
      where: {
        user_id: req.session.users.id,
        instructor_id: req.query.id,
        expired_at: { [Op.gt]: [today] },
        status: 1,
      },
    });

    let lesson = [];
    let not_subscribed = true;

    if (subscription) {
      lesson = await Lesson.findAll({
        where: {
          instructor_id: req.query.id,
          game_id: req.query.game_id,
        },
        raw: true,
      });
      not_subscribed = false;
    }

    let game_id = req.query.game_id;

    // return res.send(lesson)
    console.log("lesson=======>", lesson);
    res.render("web/detail", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      user,
      lesson,
      game_id,
      title,
      allgames,
      not_subscribed,
    });
  },
  message: async (req, res) => {
    title = "buddy";
    let instructors = await getInstructor();
    let search_user = req.query.search;

    let where = {
      id: {
        [Op.not]: req.session?.users?.id,
      },
      role: "1",
    };

    if (search_user != "" && search_user != undefined) {
      where.name = { [Op.substring]: search_user };
    }

    let chat_count = await Chat.count({
      where: {
        to: req.session.users?.id,
        read: "0",
      },
    });

    let chat = await User.findAll({
      where,
      include: [
        {
          model: Chat,
          where: {
            from: req.session.users?.id,
            block: "0",
          },
          required: false,
        },
        { model: ChatTimimg },
      ],
      order: [
        [Chat, "id", "DESC"],
        [Chat, "read", "ASC"],
      ],
    });

    let receiver_id = req.query.id;
    let selected_user = await User.findOne({
      where: {
        id: receiver_id,
      },
    });

    let isBlocked = await Chat.findAll({
      where: {
        from: req.session.users?.id,
        to: receiver_id,
        block: "0",
      },
    });

    let ischatted = await Chat.findAll({
      where: {
        from: req.session.users?.id,
        to: receiver_id,
      },
    });

    let sender_id = req.session?.users?.id;

    let all_messages = await Chat.findAll({
      where: {
        from: { [Op.in]: [receiver_id, sender_id] },
        to: { [Op.in]: [receiver_id, sender_id] },
      },
      raw: true,
    });
    let allgames = await Game.findAll({ raw: true });

    res.render("web/message", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      selected_user,
      receiver_id,
      all_messages,
      title,
      allgames,
      chat,
      isBlocked,
      chat_count,
      ischatted,
    });
  },
  termsofuse: async (req, res) => {
    let instructors = await getInstructor();
    let allgames = await Game.findAll({ raw: true });

    res.render("web/termsofuse", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      allgames,
    });
  },
  reviews: async (req, res) => {
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();

    res.render("web/reviews", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      allgames,
    });
  },
  rate: async (req, res) => {
    title = "buddy";
    let allgames = await Game.findAll({ raw: true });
    let instructors = await getInstructor();
    let receiver_id = req.query.id;

    await getAverageRate(receiver_id);

    let rate = await Rate.findOne({
      where: {
        rate_to: receiver_id,
        rate_from: req.session.users?.id,
      },
    });
    let already_rate = false;
    if (rate) {
      already_rate = true;
    }

    let user = await User.findOne({
      where: {
        id: receiver_id,
      },
      include: [
        {
          model: AverageRate,
        },
      ],
    });
    console.log(user);

    res.render("web/rate", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      user,
      receiver_id,
      title,
      allgames,
      already_rate,
    });
  },
  privacy: async (req, res) => {
    let instructors = await getInstructor();
    let allgames = await Game.findAll({ raw: true });

    res.render("web/privacy_policy", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      allgames,
    });
  },
  payment01: async (req, res) => {
    let instructors = await getInstructor();
    let allgames = await Game.findAll({ raw: true });
    let request = req.query;
    let amount = request.amount;
    let pac_type = request.type;
    title = "home";
    let login_user = req.session.users;
    let payment = await Payment.findAll({
      where: {
        user_id: req.session?.users?.id,
      },
      raw: true,
    });

    let instructor_id = request.user_id;
    let game_id = request.game_id;
    let user_id = req.session?.users?.id;
    let stripe_detail = await StripeDetail.findOne({
      where: {
        user_id: instructor_id,
        status: 1,
      },
      attributes: ["acc_id"],
    });
    let account_id = stripe_detail?.acc_id;

    res.render("web/payment01", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      payment,
      title,
      amount,
      pac_type,
      login_user,
      instructor_id,
      game_id,
      user_id,
      allgames,
      account_id,
    });
  },
  payment02: async (req, res) => {
    let instructors = await getInstructor();
    title = "payment02";
    let allgames = await Game.findAll({ raw: true });

    res.render("web/payment02", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
    });
  },

  instructorProfile: async (req, res) => {
    let instructors = await getInstructor();
    title = "instructor_profile";
    let allgames = await Game.findAll({ raw: true });

    let inst_acc = await User.findOne({
      where: {
        id: req.query.id,
      },
      attributes: ["name", "email", "phone_number", "location", "age", "image"],
    });

    let sports = await Sport.findAll({
      where: {
        user_id: req.query.id,
      },
      include: [
        {
          model: Game,
        },
        {
          model: Package,
          where: {
            instructor_id: req.query.id,
          },
        },
      ],
    });

    let lessons = await Lesson.findAll({
      where: {
        instructor_id: req.query.id,
      },
      attributes: ["title", "description", "game_id", "instructor_id"],
    });

    console.log(sports);

    res.render("web/instructor_profile", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
      inst_acc,
      sports,
      lessons,
    });
  },

  subscription: async (req, res) => {
    let instructors = await getInstructor();
    title = "instructor_profile";
    let allgames = await Game.findAll({ raw: true });
    let request = req.query;

    let subs = await Subscription.findOne({
      where: {
        instructor_id: request.inst_id,
        game_id: request.game_id,
        user_id: req.session?.users.id,
      },
    });

    let videos;

    if (subs) {
      videos = await Lesson.findAll({
        where: {
          instructor_id: request.inst_id,
          game_id: request.game_id,
        },
      });
      res.render("web/videos", {
        videos,
        session: req.session,
        instructors,
        title,
        allgames,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
      });
    } else {
      title = "booknow";

      let packages = await Package.findOne({
        where: {
          instructor_id: request.inst_id,
          game_id: request.game_id,
        },
      });

      if (packages) {
        let user_id = request.inst_id;
        let game_id = request.game_id;

        let today = new Date();
        let expired_at = new Date(new Date().setDate(today.getDate()));

        const dt = Date.parse(expired_at);
        let todayDt = dt / 1000;

        let subscription = await Subscription.findAll({
          where: {
            instructor_id: user_id,
            user_id: req.session.users?.id,
            game_id: game_id,
            expired_at: { [Op.gt]: [todayDt] },
          },
        });

        res.render("web/booknow", {
          session: req.session,
          success_msg: req.flash("success_msg"),
          error_msg: req.flash("error_msg"),
          instructors,
          packages,
          title,
          user_id,
          game_id,
          allgames,
          subscription,
        });
      } else {
        let videos = await Lesson.findAll({
          where: {
            instructor_id: request.inst_id,
            game_id: request.game_id,
          },
        });
        res.render("web/videos", {
          videos,
          session: req.session,
          instructors,
          title,
          allgames,
          success_msg: req.flash("success_msg"),
          error_msg: req.flash("error_msg"),
        });
      }
    }
  },

  getDirection: async (req, res) => {
    let instructors = await getInstructor();
    title = "getdirection";
    let allgames = await Game.findAll({ raw: true });
    let user = await User.findOne({
      where: {
        id: req.query.id,
      },
    });

    res.render("web/getdirection", {
      session: req.session,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      instructors,
      title,
      allgames,
      user,
    });
  },
};
