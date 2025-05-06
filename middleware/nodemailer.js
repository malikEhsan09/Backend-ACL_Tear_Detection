import nodemailer from "nodemailer";

export const nodemailer = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "ehsanahmed122001@gmail.com",
      pass: "lzjb cgjk ydmq dwxo",
    },
  });

  // ? verify

  transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log(success, "server is ready to take our message");
    }
  });
};
