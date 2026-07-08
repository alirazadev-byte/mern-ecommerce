const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    // service: process.env.SMPT_SERVICE,
    auth: {
      user: "ranaafaqranaafaq68@gmail.com",
      pass: "yvqsaykswgxrvmap",
    },

    tls: {
      rejectUnauthorized: false,
    },
  });
  const mailOptions = {
    from: "ranaafaqranaafaq68@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
