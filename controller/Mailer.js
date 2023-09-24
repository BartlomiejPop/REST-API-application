require("dotenv").config();
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "tmp");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.USER,
		pass: process.env.PASSWORD,
	},
});

const sendEmail = (to, subject, text) => {
	const mailOptions = {
		from: process.env.USER,
		to,
		subject,
		text,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Błąd podczas wysyłania e-maila:", error);
		} else {
			console.log("E-mail został wysłany:", info.response);
		}
	});
};
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
	limits: {
		fileSize: 1048576,
	},
});
const upload = multer({
	storage: storage,
});

module.exports = { upload, sendEmail };
