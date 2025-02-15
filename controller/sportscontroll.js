import Sport from "../models/Sport.js";
import Game from "../models/Game.js";
import User from "../models/users.js";
import Validator from "validatorjs";
import helper from "../helper/helpers.js";
import reply from "../helper/reply.js";




export default {
    //===============list sports================//
    listsports: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view = await Sport.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include:[
              
                {
                   model:Game,
                   as:"game_detail"
                },
                {
                    model:User,
                    as:"user_detail",
                    
                 
                },
                ],
                
              
            })
            console.log({view});

            // console.log(view.game_detail,'===============================');
            // return
            res.render("sports/list", { msg: req.flash('msg'), view, session: req.session, main: "", title: 'sports_s_p_active' })
            // console.log(error,"Errrjihj")
        } catch (error) {
            console.log(error, "========================");
        }
    },
    //===================status sports===============//
    sportsstatus: async (req, res) => {
        var check = await Sport.update({
            status: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        // req.flash('msg', 'Status update   Successfully' );
        res.send(false)
    },

    //================shop======================//
    deletesports: async (req, res) => {
        try {
            const userdelete = await Sport.destroy({
                where: {
                    id: req.body.id
                }
            })
            req.flash('msg', 'sports deleted successfully')
            res.send('1')
        } catch (error) {
            error
        }
    },
  
    viewsports: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view_user = await Sport.findOne({

                include:[
                    {
                        model:Game,
                        as:"game_detail"
                     },
                           {
                         model:User,
                         as:"user_detail",
                         
                      
                     },
                ],
                where: {
                    id: req.params.id
                }
            })
            // console.log(view_user,'========================================');
            // return
            res.render("sports/view", { view_user, session: req.session, msg: req.flash('msg'), main: "", title: 'sports_s_p_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },

    


}