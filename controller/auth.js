const jwt = require("jsonwebtoken");
const passport = require("../config/config-passport");
const gravatar = require("gravatar");
const User = require("../service/schemas/user");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
require("dotenv").config();
let token;
const secret = process.env.SECRET;

const tokenDatabase = {};

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

const auth = (req, res, next) => {
	passport.authenticate("jwt", (err, user) => {
		if (!user || err) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized",
				data: "Unauthorized",
			});
		}
		req.user = user;
		next();
	})(req, res, next);
};

const signup = async (req, res, next) => {
	const { username, email, password } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		return res.status(409).json({
			status: "error",
			code: 409,
			message: "Email in use",
			data: "Conflict",
		});
	}
	try {
		const verificationToken = uuidv4();
		tokenDatabase[email] = verificationToken;

		const avatarURL = gravatar.url(email, { s: "200", d: "identicon" });
		const newUser = new User({ username, email, avatarURL, verificationToken });
		console.log(newUser);
		newUser.setPassword(password);
		await newUser.save();
		sendEmail(
			email,
			"email verification",
			`click the link below to verify your e-mail: http://localhost:3000/api/users/verify/${verificationToken}`
		);
		return res.status(201).json({
			status: "success",
			code: 201,
			data: {
				message: "Registration successful. Check your email to verify",
			},
		});
	} catch (error) {
		res.status(400).json({
			status: "Bad Request",
			code: 400,
			data: {
				message: "Registration failed",
			},
		});
		next(error);
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user || !user.validPassword(password)) {
		return res.status(401).json({
			status: "error",
			code: 401,
			message: "Incorrect login or password",
			data: "Bad request",
		});
	}
	const isVerified = user.verify;
	if (!isVerified) {
		return res.status(403).json({
			status: "error",
			code: 403,
			message: "email not verified",
			data: "Forbidden",
		});
	}
	try {
		const payload = {
			id: user.id,
			username: user.username,
		};

		token = jwt.sign(payload, secret, { expiresIn: "1h" });
		user.token = token;
		await user.save();

		return res.status(200).json({
			status: "success",
			code: 200,
			data: {
				token: token,
				user: {
					email: email,
					subscription: user.subscription,
				},
			},
		});
	} catch (err) {
		return res.status(400).json({
			status: "Bad request",
			code: 400,
			message: `Login failed ${err}`,
		});
	}
};

const logout = async (req, res) => {
	const { _id } = req.user;
	const user = await User.findById(_id);
	if (user.token) {
		user.token = "";
		await user.save();
		return res.status(200).json({
			code: 204,
			status: "Logged out",
		});
	}
	return res.status(400).json({
		code: 400,
		Status: "Bad request",
		ContentType: "application / json",
		ResponseBody: {
			message: "Bad request",
		},
	});
};

const current = async (req, res) => {
	const { _id } = req.user;
	const user = await User.findById(_id);
	if (user.token) {
		return res.status(200).json({
			code: 200,
			status: "OK",
			ResponseBody: {
				email: user.email,
				subscription: user.subscription,
			},
		});
	}
	return res.status(400).json({
		code: 400,
		Status: "Bad request",
		ContentType: "application / json",
		ResponseBody: {
			message: "Bad request",
		},
	});
};

const verification = async (req, res, next) => {
	const { verificationToken } = req.params;
	const user = await User.findOne({ verificationToken });
	const isVerified = user.verify;
	if (!user || isVerified) {
		return res.status(404).json({
			code: 404,
			Status: "Not Found",
			ResponseBody: {
				message: "Not Found",
			},
		});
	}

	user.verify = true;
	await user.save();
	return res.status(200).json({
		code: 200,
		ResponseBody: {
			message: "Verification successful",
		},
	});
};

const verify = async (req, res, next) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({
			code: 400,
			ResponseBody: {
				message: "missing required field email",
			},
		});
	}
	const user = await User.findOne({ email });
	const verificationToken = user.verificationToken;
	const isVerified = user.verify;
	if (!isVerified) {
		sendEmail(
			email,
			"email verification",
			`click the link below to verify your e-mail: http://localhost:3000/api/users/verify/:${verificationToken}`
		);
		delete tokenDatabase[email];
		return res.status(200).json({ message: "e-mail verification sent." });
	} else {
		return res
			.status(400)
			.json({ message: "Verification has already been passed" });
	}
};

module.exports = {
	auth,
	signup,
	login,
	logout,
	current,
	verification,
	verify,
};
