import User from "../models/users.js";
import Shop from "../models/shop.js";
import Lesson from "../models/Lesson.js";
import Game from "../models/Game.js";
import Sport from "../models/Sport.js";

export default{

    dashboard: async (req, res) => {
        if (!req.session.user) return res.redirect('/admin/get_login')
        const usercount = await User.count({
            
        });
        const shopcount = await Shop.count({
            
        });
        const sportscount = await Sport.count({
            
        });
        const lessoncount = await Lesson.count({
            
        });
        const gamecount = await Game.count({
            
        });
     
        // if(!req.session.user) return res.redirect('/login')
        res.render("dashboard", { usercount,shopcount,lessoncount,sportscount,gamecount,title:'dashboard',main : "", msg: req.flash('msg')  , session: req.session })
    },

  
}