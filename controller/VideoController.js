import Video from "../models/Video.js";
import Validator from "validatorjs";
import reply from "../helper/reply.js";
import Game from "../models/Game.js";

export default {
  async videoView(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");
    const view = await Video.findAll({
      include: [
        {
          model: Game,
        },
      ],
    });
    res.render("videos/videolist", {
      view,
      main: "",
      msg: req.flash("msg"),
      session: req.session,
      title: "video",
    });
  },

  async addVideo(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");
    const view = await Video.findAll();
    const allgames = await Game.findAll();
    res.render("videos/addvideo", {
      view,
      allgames,
      msg: req.flash("msg"),
      showvideo: false,
      msg: req.flash("msg"),
      session: req.session,
      main: "",
      title: "video",
    });
  },

  async editVideo(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");

    const summary = await Video.findOne({
      where: {
        id: req.query.id,
      },
    });
    const allgames = await Game.findAll();
    let selected_game = await Game.findOne({
      where: {
        id: summary.game_id,
      },
    });

    let id = req.query.id;

    res.render("videos/editvideo", {
      summary,
      allgames,
      selected_game,
      id,
      msg: req.flash("msg"),
      session: req.session,
      main: "",
      title: "video",
    });
  },

  async viewVideo(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");

    const view = await Video.findOne({
      where: {
        id: req.query.id,
      },
    });
    res.render("videos/viewvideo", {
      view,
      msg: req.flash("msg"),
      session: req.session,
      main: "",
      title: "video",
    });
  },

  async VideoCreate(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");
    let request = req.body;
    let validation = new Validator(request, {
      game_id: "required",
      title: "required",
      description: "required",
      url: "required",

    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }
    let game = await Game.findOne({
      where: {
        id: request.game_id,
      },
    });
    if (!game) {
      return res.json(reply.failed("This game is not available"));
    }
    let video_data = {
      user_id: req.session.user.id,
      game_id: request.game_id,
      title: request.title,
      description: request.description,
      url: request.url,
      type: request.type
    };

    await Video.create(video_data);
    req.flash("msg", "Video uploaded successfully");
    return res.json(reply.success("Video uploaded successfully"));
  },

  async VideoUpdate(req, res) {
    if (!req.session.user) return res.redirect("/admin/get_login");
    let request = req.body;
    let validation = new Validator(request, {
      game_id: "required",
      title: "required",
      description: "required",
      url: "required",
      type:"required"
    });
    if (validation.fails()) {
      return res.json(reply.failed(reply.firstError(validation)));
    }
    let game = await Game.findOne({
      where: {
        id: request.game_id,
      },
    });
    if (!game) {
      return res.json(reply.failed("This game is not available"));
    }

    let video = await Video.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!video) {
      return res.send(reply.failed("This video is not found"));
    }

    let video_data = {
      user_id: req.session.user.id,
      game_id: request.game_id,
      title: request.title,
      description: request.description,
      url: request.url,
      type: request.type
    };

    await Video.update(video_data, { where: { id: req.params.id } });

    req.flash("msg", "Video updated successfully");
    return res.json(reply.success("Video updated successfully"));
  },

  async dltVideo(req, res) {
    try {
      await Video.destroy({
        where: {
          id: req.params.id,
        },
      });
      req.flash("msg", "Video deleted successfully");
      res.send("1");
    } catch (error) {
      error;
    }
  },
};
