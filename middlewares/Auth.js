import Game from "../models/Game.js";
import User from "../models/users.js";
import Sport from "../models/Sport.js";

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
    ],
  });
  return instructors;
}
export default {
  Authenticate: async function (req, res, next) {
    let session = req.session.users;
    if (!session) {
      let instructors = await getInstructor();
      let title = "home";
      const sportsOffered = await Game.findAll();
      let allgames = await Game.findAll({ raw: true });

      res.render("web/register", {
        session: req.session,
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg"),
        instructors,
        sportsOffered,
        title,
        allgames
      });
    } else {
      next();
    }
  },
};
