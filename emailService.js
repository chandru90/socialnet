import nodemailer from "nodemailer";

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  port: 465,
  secure: true, // true for 465, false for other ports
  logger: true,
  debug: true,
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
});

// Function to send email
export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to, // recipient's email
    subject, // Subject line
    text, // plain text body
  };

  return transporter.sendMail(mailOptions);
};
