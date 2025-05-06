import nodemailer from "nodemailer";

export const sendContactEmail = async ({
  name,
  email,
  query,
  gender,
  message,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // The email you want to receive messages at
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nQuery: ${query}\nGender: ${gender}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
};
