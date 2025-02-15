import Shop from '../models/shop.js';
import session from 'express-session';
import flash from 'express-flash';
import path from 'path';
import moment from 'moment';
import console from 'console';
import { UUIDV4 } from 'sequelize';
import helper from '../helper/helpers.js';


export default{
    //============view add shop=============//
    shop: async (req, res) => {
        if (!req.session.user) return res.redirect('/admin/get_login')
        const view = await Shop.findAll()
        res.render("shop/add", {
            view, msg: req.flash('msg'), session: req.session,
            main: "", title: 'shop_s_p_active'
        })
    },
    //==================add shop=================//
    postshop: async (req, res) => {

        try {

            var image = req.files?.image.name

            uploadDir = path.join(__dirname, '../public/images', image);
            console.log('uploadDir', uploadDir);


            if (req.files.image) {
                req.files.image.mv(uploadDir, (err) => {
                    if (err)
                        return res.status(500).send(err);
                });
            }
            console.log(req.body, "===========================================");

            const data = await Shop.create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                image: image
            });
            console.log(data, "===========================================");
            if (data) {
                console.log(data, "===========================================");
                req.flash('msg', 'Add shop successfully')
                res.redirect("/listshop")
            } else {
                res.redirect("/listshop")
            }
        } catch (error) {

            console.log("===========", error)

        }
    },

    //===============list shop================//
    listshop: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view = await Shop.findAll({
                order: [
                    ['id', 'DESC']
                ]
            })
            res.render("shop/list", { msg: req.flash('msg'), view, session: req.session, main: "", title: 'shop_s_p_active' })
            // console.log(error,"Errrjihj")


        } catch (error) {
            console.log(error, "========================");
        }
    },
    //===================status shop===============//
    shopstatus: async (req, res) => {
        var check = await Shop.update({
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
    deleteshop: async (req, res) => {
        try {
            const userdelete = await Shop.destroy({
                where: {
                    id: req.body.id
                }
            })
            req.flash('msg', 'Shop deleted successfully')
            res.send('1')
        } catch (error) {
            error
        }
    },
    //=====================edit view shop==============//
    editshop: async (req, res) => {
        if (!req.session.user) return res.redirect('/admin/get_login')

        const summary = await Shop.findOne({
            where: {
                id: req.params.id
            }
        });
        res.render("shop/edit", { summary, msg: req.flash('msg'), session: req.session, main: "", title: 'shop_s_p_active' })
    },
    //===================edit shop======================//
    editpostshop: async (req, res) => {
        try {
            let findUserData = await Shop.findOne({
                where: {
                    id: req.params.id
                },
                raw: true
            });
            if (!findUserData) {
                return res.redirect("/listshop");
            }


            if (req.files && req.files.image) {
                image = await helper.files_upload(req.files.image, "images")
            }
            else {
                image = findUserData.image

            }
            const summary = await Shop.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                image: image

            }, { where: { id: req.params.id } })

            // console.log(summary,'===============================');
            // return
            if (summary == true) {
                req.flash('msg', 'Edit shop updated successfully',)
                res.redirect("/admin/listshop")
            } else {
                res.redirect("/admin/listshop")
            }

        } catch (error) {
            error, "error"
            console.log(error, "error");

        }
    },
    view: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view_user = await Shop.findOne({
                where: {
                    id: req.params.id
                }
            })
            // console.log(view_user,'========================================');
            // return
            res.render("shop/view", { view_user, session: req.session, msg: req.flash('msg'), main: "", title: 'shop_s_p_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },


}