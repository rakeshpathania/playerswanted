
import Game from "../models/Game.js";
import session from "express-session";
import flash from "express-flash";
import path from "path";
import moment from "moment";
import console from "console";
import { UUIDV4 } from "sequelize";
import helper from "../helper/helpers.js";

export default{
    //============view add game=============//
    game: async (req, res) => {
        if (!req.session.user) return res.redirect("/get_login")
        const view = await Game.findAll()
        res.render("game/add", {
            view, msg: req.flash('msg'), session: req.session,
            main: "", title: 'game_g_e_active'
        })
    },
    //==================add game=================//
    postgame: async (req, res) => {

        try {   

            let image = "";

            if (req.files && req.files.image) {
                image = await helper.files_upload(req.files.image, "games")
            }
            else {
                image = findUserData.image

            }

            const data = await Game.create({
                name: req.body.name,
                image: image
            });
            console.log(data, "===========================================");
            if (data) {
                console.log(data, "===========================================");
                req.flash('msg', 'Add game successfully')
                res.redirect("/admin/listgame")
            } else {
                res.redirect("/admin/listgame")
            }
        } catch (error) {

            console.log("===========", error)

        }
    },

    //===============list game================//
    listgame: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view = await Game.findAll({
                order: [
                    ['id', 'DESC']
                ]
            })
            res.render("game/list", { msg: req.flash('msg'), view, session: req.session, main: "", title: 'game_g_e_active' })
            // console.log(error,"Errrjihj")

        } catch (error) {
            console.log(error, "========================");
        }
    },
    //===================status game===============//
    shopstatus: async (req, res) => {
        var check = await Game.update({
            status: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        // req.flash('msg', 'Status update   Successfully' );
        res.send(false)
    },

    //================game======================//
    deletegame: async (req, res) => {
        try {
            const userdelete = await Game.destroy({
                where: {
                    id: req.body.id
                }
            })
            req.flash('msg', 'game deleted successfully')
            res.send('1')
        } catch (error) {
            error
        }
    },
    //=====================edit view game==============//
    editgame: async (req, res) => {
        if (!req.session.user) return res.redirect('/admin/get_login')

        const summary = await Game.findOne({
            where: {
                id: req.params.id
            }
        });
        res.render("game/edit", { summary, msg: req.flash('msg'), session: req.session, main: "", title: 'game_g_e_active' })
    },
    //===================edit game======================//
    editpostgame: async (req, res) => {
        try {
            let findUserData = await Game.findOne({
                where: {
                    id: req.params.id
                },
                raw: true
            });

           
            if (!findUserData) {
                return res.redirect("/listgame");
            }

            let image = "";

            if (req.files && req.files.image) {
                image = await helper.files_upload(req.files.image, "games")
            }
            else {
                image = findUserData.image

            }
            const summary = await Game.update({
                name: req.body.name,
                image: image
                

            }, { where: { id: req.params.id } })

            // console.log(summary,'===============================');
            // return
            if (summary == true) {
                req.flash('msg', 'Edit game updated successfully',)
                res.redirect("/admin/listgame")
            } else {
                res.redirect("/admin/listgame")
            }

        } catch (error) {
            error, "error"
            console.log(error, "error");

        }
    },
    gameview: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view_user = await Game.findOne({
                where: {
                    id: req.params.id
                }
            })
            // console.log(view_user,'========================================');
            // return
            res.render("game/view", { view_user, session: req.session, msg: req.flash('msg'), main: "", title: 'game_g_e_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },


}