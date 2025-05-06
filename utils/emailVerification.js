import nodemailer from "nodemailer"

// later on we use this custom error
// import { createError } from "../error"; 

export const sendVerifyEmail  = async (name, email, id)=>{
     
    try {
        const transporter =  nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user : 'ehsanahmed122001@gmail.com',
                pass : 'malikEhsan@122001'
            },
        })
        const mailOptions = {
            from : 'ehsanahmed122001@gmail.com',
            to : email,
            subject : "Email Verification",
            text : `Hi ${name}, Please click the link to verify your email http://localhost:3000/verify/?id=${id}`
        }

        await transporter.sendMail(mailOptions , (err, info)=>{
            if(err){
                console.log(err);
            }else{
                console.log(`Email has been sent : ${info.response}`);
            }

        })
    
    } catch (error) {
        console.log(error);
    };
}