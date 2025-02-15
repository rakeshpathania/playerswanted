import User from '../models/users.js';
import toastr from 'toastr';
import bcrypt from 'bcrypt';
import path from 'path';
import Sequelize from 'sequelize';

 const Op = Sequelize.Op;

export default {
    //=====================users list=============//
    users: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')
            const fiind_user = await User.findAll({

            })
            console.log(fiind_user,'================================');
            res.render("users/users", {msg: req.flash('msg'),fiind_user,session: req.session, main : "",title:'users_u_l_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    //==========================view users================//
    view: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const view_user = await User.findOne({
                where: {
                    id: req.params.id
                }
            })
            res.render("users/view", {msg: req.flash('msg'), view_user,session: req.session , main : "",title:'users_u_l_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    userstatus: async (req, res) => {

        console.log(">>>>>>>>>>>>>>>>>",req.body);

        var check = await User.update({
            type: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });

        if (check) {
            return res.send('Staus updated successfully!')
       }

       return res.status(500).send('Failed')
    },


   

}