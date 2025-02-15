import CMS from '../models/CMS.js';
import session from 'express-session';
import flash from 'express-flash';

export default{
  // aboutus view//
  aboutus: async (req, res) => {
      try {
        if (!req.session.user) return res.redirect('/admin/get_login')

          const about = await CMS.findOne({
              where: {
                  id: 1
              }
          });
          res.render("cms/about", {about, session: req.session,title:'cms_a_active',main:"cms",msg:req.flash('msg')})
      } catch (error) {
        console.log("error",error)
      }
} ,
// add about us
updateaboutus:async(req,res)=>{ 
    try {
        const about= await CMS.update({
            title:req.body.title,
            content:req.body.content,
        },{
            where:{
                id:1
            }
        });
        if(about==true){
       

            req.flash('msg',' About Us Updated Successfully');
            res.redirect("/admin/aboutus")
        }else{
            req.flash('msg',' About Us Updated Successfully');
            res.redirect("/admin/aboutus")
        }
    } catch (error) {
        console.log("error",error);
    }
},
termscondition: async (req, res) => {
    if (!req.session.user) return res.redirect('/admin/get_login')

    const about = await CMS.findOne({
        where: {
            id: 3
        }
    });
    res.render("cms/terms&condition", { about, session: req.session,main:"cms",title:'cms_t_c_active',msg:req.flash('msg')})
},
postTerms:async(req,res)=>{
    try {
        const about= await CMS.update({
            title:req.body.title,
            content:req.body.content,
        },{
            where:{
                id:3
            }
        });
        if(about==true){
            req.flash('msg',' Term Condition Updated Successfully')
            res.redirect("/admin/condition")
            
        }else{
            req.flash('msg',' Term Condition Updated Successfully')
            res.redirect("/admin/condition")
        }
    } catch (error) {
        console.log("error",error);
    }   
},
// view privacy//
privacypolicy: async (req, res) => {
    if (!req.session.user) return res.redirect('/admin/get_login')

    const about = await CMS.findOne({
        where: {
            id: 2
        }
    });
    res.render("cms/privacypolicy",{about, session: req.session ,title:'cms_p_p_active',main:"cms",msg:req.flash('msg')})
},
  // addprivacy//
  updateprivacypolicy:async(req,res)=>{
    try {
        const about= await CMS.update({
            title:req.body.title,
            content:req.body.content,
        },{
            where:{
                id:2
            }
        });
        if(about==true){
            req.flash('msg',' Privacy policy updated successfully')
            res.redirect("/admin/privacypolicy")
        }else{
            req.flash('msg',' Privacy policy updated successfully')
            res.redirect("/admin/privacypolicy")
        }
    } catch (error) {
        console.log("error",error);
    }
},
help: async (req, res) => {
    if (!req.session.user) return res.redirect('/admin/get_login')

    const help = await CMS.findOne({
        where: {
            id: 4
        }
    });
    res.render("cms/help&support", { help, session: req.session,title:'cms_h_p_active',main:"cms",msg:req.flash('msg')})
},
updatehelp:async(req,res)=>{

    try {
        const help= await CMS.update({
            title:req.body.title,
            content:req.body.content,
        },{
            where:{
                id:4
            }
        });
        if(help==true){
            req.flash('msg',' Help & support updated successfyullY')
            res.redirect("/admin/help")
        }else{
            req.flash('msg','  Help & support updated successfyullY')
            res.redirect("/admin/help")
        }
    } catch (error) {
        console.log("error",error);
        
    }

}
}