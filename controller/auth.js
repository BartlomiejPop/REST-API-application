const jwt = require("jsonwebtoken");
const passport = require("../config/config-passport");
const User = require("../service/schemas/user");
require("dotenv").config();
let token;
const secret = process.env.SECRET;

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
		const newUser = new User({ username, email });
		newUser.setPassword(password);
		await newUser.save();
		return res.status(201).json({
			status: "success",
			code: 201,
			data: {
				message: "Registration successful",
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
	try {
		const payload = {
			id: user.id,
			username: user.username,
		};

		token = jwt.sign(payload, secret, { expiresIn: "1h" });
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
	} catch {
		return res.status(400).json({
			status: "Bad request",
			code: 400,
			message: "Login failed",
		});
	}
};

const logout = async (req, res) => {
	const { _id } = req.user;
	const user = await User.findById(_id);
	if (user) {
		await User.findByIdAndRemove(_id);
		return res.status(200).json({
			code: 204,
			status: "Logged out",
		});
	}
	return res.status(401).json({
		status: "Unauthorized",
		code: 401,
		ResponseBody: {
			message: "Not authorized",
		},
	});
};

const current = async (req, res) => {
	try {
		const { _id } = req.user;
		const user = await User.findById(_id);
		if (user) {
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
			Status: "Unauthorized",
			ContentType: "application / json",
			ResponseBody: {
				message: "Bad request",
			},
		});
	} catch (err) {
		return res.status(401).json({
			status: "Unauthorized",
			code: 401,
			ResponseBody: {
				message: "Not authorized",
			},
		});
	}
};

module.exports = {
	auth,
	signup,
	login,
	logout,
	current,
};
