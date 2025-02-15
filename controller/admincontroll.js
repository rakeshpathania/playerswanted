import Admindetail from '../models/Admindetail.js';
import bcrypt from 'bcrypt';
import path from 'path';
import helper from '../helper/helpers.js'




export default{
    login: async (req, res) => {
        try {
            res.render("admin/login",{ msg: req.flash('msg') })
        } catch (error) {
        }
    },
    register: async (req, res) => {
        try {
          console.log("Register request body: ", req.body);
          const { name, email, password } = req.body;
          const existingAdmin = await Admindetail.findOne({ where: { email } });
    
          if (existingAdmin) {
            req.flash('msg', 'Email already registered');
            // return res.redirect('/admin/get_register');
          }
    
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log(req, "req.file>>>>>>>>>>>>>>")
          // Save the admin details
          const newAdmin = await Admindetail.create({
            name,
            email,
            password: hashedPassword,
            image: req.files ? req.files.image?.name : null, // Handle image upload
          });
    
          req.flash('msg', 'Registration successful. Please log in.');
        } catch (error) {
          console.error("Error in register route: ", error);
          req.flash('msg', 'Registration failed. Try again.');
        }
      },
    
    login_in: async (req, res) => {
        try {

            var { email, password } = req.body
            const admin_login = await Admindetail.findOne({
                where: {
                    email: req.body.email,

                }
            })
            if (admin_login == null) {
                req.flash('msg', 'Email and password is incorrect');
            
                res.redirect('/admin/get_login')
            }
            else {
                const isMatch = await bcrypt.compare(password, admin_login.password)
                if (isMatch == true) {
                    req.session.user = admin_login
                    req.session.image=admin_login.image
                   req.flash('msg', ' Logged In Successfully');
                    
                    res.redirect('/admin/dashboard')
                } else {
                    req.flash('msg', "Email or password is incorrect");

                    
                    res.redirect('/admin/get_login')

                }
            }
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>", error)
        }
    },
    log_out: async (req, res) => {
        try {
            req.session.destroy( )
            res.redirect("/admin/get_login")
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    admin_profile: async (req, res) => {

        try {
            if (!req.session.user) return res.redirect('/get_login')
            const admin_details = await Admindetail.findOne({
                where:{
                id: req.session.user.id
                }
            })
            console.log('>>>>>>>>>>>>>>>>>>', admin_details)
            res.render("admin/adminprofile", { admin_details, session: req.session,title:'admin_active',msg: req.flash('msg'),main:""})
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    _profile_post: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>",req.body)
        
        
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const admin_details = await Admindetail.findOne({
                where: {
                    id: req.session.user.id
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>>", admin_details)
            
            if (req.files && req.files.image) {
                var image = helper.fileUpload(req.files.image, 'images')
                console.log(image, '======================++!!!!')

                
              
            }
            // else {
            //     var img = admin_details.image
            // }
            // console.log(">>>>>>>>>>>>>>>",img)
            console.log(">>>>>>>>>>>>>>>>>>>>",req.body);
            
            
            

            const data = await Admindetail.update({
                name: req.body.name,
                email: req.body.email,
                image: image,
            }, {
                where: {
                    id: req.session.user.id
                },
            })
            console.log(">>>>>>>>>>>>>>>>>>>>>", data,req.session.user.email)


            var addsession = await Admindetail.findOne({
                where: {
                    email: req.session.user.email
                }
            })
            req.session.user = addsession
            if (data) {
                req.flash('msg', 'Your profle updated successfully');
                res.redirect('/admin/dashboard')
            } else {
                res.redirect("/admin/admin_profile")
            }
        } catch (error) {
            console.log(">>>error>>>>", error);
        }


    },
    change_password: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/admin/get_login')

            res.render("admin/changePassword", { session: req.session ,title:'change_active',main:"",msg: req.flash('msg')})
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_password: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/dashboard/get_login')
			console.log(">>>>>>>>>>>", req.body);
			const changepass = await Admindetail.findOne({
				where: {
					id: req.session.user.id
				}
				// limit:1
			})
			const hash = await bcrypt.hash(req.body.newpassword, 10)
			const compare = await bcrypt.compare(req.body.oldpassword, changepass.password)
			if (!compare) {
                req.flash('msg', 'Please fill something');
				res.redirect('/change_password')
			}
			else {
				console.log("success");
				await Admindetail.update({
					password: hash,
				}, {
					where: {
						id: req.session.user.id
					}
				})
				// 
				//  console.log('------ passeword has been change-------------------');
                req.flash('msg', 'Password changed done');
				res.redirect('/admin/dashboard');
			}
		} catch (error) {
			console.log(error);
		}

    },
    faqspage: async (req, res) => {
        if (!req.session.user) return res.redirect('/admin/get_login',);
        res.render("faqspage/faqspage", {
          
            session: req.session,
            msg: req.flash('msg')
        })


    },

    faqspost: async (req, res) => {

        try {
            console.log("<<<<<<<<<<<<body data>>>>>>>>>>></body>", req.body)
            let getdata = await db.faqs.create(req.body)
            req.flash('msg', 'Added Successfully');
            res.redirect("/faqspage")
        } catch (error){
            console.log(":>>>>>>>>>>>>>>>>>>",error);
            

        }


    },
    faqslisting: async (req, res) => {

        if (!req.session.user) return res.redirect("/get_login",{msg: req.flash('msg')});

        const views = await db.faqs.findAll({
            Order: [
                ['id', 'Desc']
            ],
            raw: true,
            
        })
        res.render("faqspage/faqslisting", {
       
            views,
            session: req.session,
            msg: req.flash('msg')
        });
    },
    faqsedit: async (req, res) => {
         if (!req.session.user) return res.redirect('/admin/get_login');
        const data = await db.faqs.findOne({

            where: {
                id: req.params.id
            },
            raw: true
        })
        console.log(">>>>>>>>>>>>>>", data);

        res.render("faqspage/faqsedit", {
          
            session: req.session,
            data,
            msg: req.flash('msg')

        })
    },
    faqseditpost: async (req, res) => {
        try {



            const data = await db.faqs.update({
                questions: req.body.questions,
                answers: req.body.answers,

            }, {

                where: {
                    id: req.params.id
                }
            })
            req.flash('msg', 'Faq Updated Successfully');
            res.redirect("/faqslisting")

        } catch (error) {
            console.log("<<<<<<<<<<<<<<<<<<<<catch error>>>>>>>>>>></catch>", error);

       }

    },
    faqsdelete: async (req, res) => {
        const data = await db.faqs.destroy({
            where: {
                id: req.body.id
            }
        })

        res.redirect("faqslisting")
    },
    status: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>",req.body);
        
        
        var check = await db.faqs.update({
            type: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });

        res.locals.flash = []; 
        if(check){
            // console.log(req.flash,'???????????????//');
            // return
            // req.flash('msg',"Status updated successfully")
            console.log(res.locals,">>>>>>>>>>>>.") 
            return res.send(true)
        }else{
            // req.flash('msg',"Failed")
            return res.send(false)
        }
     
    },
    faqsview: async (req, res) => {
        if (!req.session.user) return res.redirect("/admin/get_login",);
        const users = await db.faqs.findOne({

            where: {
                id: req.params.id
            },
            raw: true
        })
        console.log(">>>>>>>>>>>>>>", users);

        res.render("faqspage/faqsview", {
         
            session: req.session,
            users,
            msg: req.flash('msg')
            
            


        })

    }














}             