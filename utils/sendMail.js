import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config(); // Ensure environment variables are loaded

const sendMail = async (options) => {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const { email, subject, template, data } = options;

    const __filename = fileURLToPath(import.meta.url); // Current file path
    const __dirname = path.dirname(__filename);

    // Construct the full path for the template
    const templatePath = path.join(__dirname, "../mails", template);

    // Render the email HTML from the EJS template
    const html = await ejs.renderFile(templatePath, data); // Ensure `await` is used

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email");
  }
};

export default sendMail;
