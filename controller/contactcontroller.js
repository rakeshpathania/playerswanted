import ContactUs from "../models/ContactUs.js"

// const path = require('path')
export default{
    // ==========list contact=========//
    listcontact: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect("/admin/login")

            const view = await ContactUs.findAll()
            res.render("contactus/list", { msg: req.flash('msg'), view, session: req.session,main:"",title:'contact_c_l_active' })
            console.log(error, "Errrjihj")
        } catch (error) {
            console.log(error,'----------------error------------------')
        }
    },
    view: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            const contactView = await ContactUs.findOne({
                where: {
                    id: req.params.id
                }
            })
            res.render("contactus/view", { contactView,session:req.session,msg: req.flash('msg'),main:"",title:'contact_c_l_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    contactstatus: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>",req.body);
        
        
        var check = await ContactUs.update({
            type: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        res.locals.flash = []; 
        if(check){
           
            console.log(res.locals,">>>>>>>>>>>>.")
            return res.send(true)
        }else{
           
            return res.send(false)
        }
    },
}