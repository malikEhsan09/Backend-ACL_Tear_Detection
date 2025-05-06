const sendInviteEmail = async (email, inviteLink) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "sandbox.smtp.mailtrap.io",
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9ed93bedbf9244",
      pass: "abfdbd2418881e",
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Club Registration Invite",
    text: `You have been invited to join a club. Please register using the following link: ${inviteLink}`,
  };

  await transporter.sendMail(mailOptions);
};
