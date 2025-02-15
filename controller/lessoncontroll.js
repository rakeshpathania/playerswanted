import Lesson from "../models/Lesson.js";
import flash from "express-flash";
import path from "path";
import moment from "moment";
import console from "console";
import { UUIDV4 } from "sequelize";
import helper from "../helper/helpers.js";
import User from "../models/users.js";
import LessonVideos from "../models/LessonVideos.js";



export default{
    //===============list lesson================//
    listlesson: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')


            const view = await Lesson.findAll({
                order: [
                    ['id', 'DESC']
                ],
                include:[{
                    model:User,
                    as:"user_detail"
                }],
            
            });

            console.log({view});
            res.render("lesson/list", { msg: req.flash('msg'), view, session: req.session, main: "", title: 'lesson_l_s_active' })
            // console.log(error,"Errrjihj")
        } catch (error) {
            console.log(error, "========================");
        }
    },
    //===================status lesson===============//
    lessonstatus: async (req, res) => {
        var check = await Lesson.update({
            status: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        // req.flash('msg', 'Status update   Successfully' );
        res.send(false)
    },

    //================lesson======================//
    deletelesson: async (req, res) => {
        try {
            const userdelete = await Lesson.destroy({
                where: {
                    id: req.body.id
                }
            })
            req.flash('msg', 'lesson deleted successfully')
            res.send('1')
        } catch (error) {
            error
        }
    },
  
    viewlesson: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view_user = await Lesson.findOne({

                include:[{
                    model:User,
                    as:"user_detail"
                },{
                   model:LessonVideos,
                   as:"lesson_videos"
                }
                

                ],

                where: {
                    id: req.params.id
                }
            })
            // console.log(view_user.lesson_videos[0],'========================================');
            // return
            res.render("lesson/view", { view_user, session: req.session, msg: req.flash('msg'), main: "", title: 'lesson_l_s_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
     //=====================edit view lesson==============//
     editlesson: async (req, res) => {
        if (!req.session.user) return res.redirect("/admin/get_login")

        const summary = await Lesson.findOne({
            where: {
                id: req.params.id
            }
        });
        res.render("lesson/edit", { summary, msg: req.flash('msg'), session: req.session, main: "", title: 'lesson_l_s_active' })
    },


}