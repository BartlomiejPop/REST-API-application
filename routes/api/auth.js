const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../service/schemas/user");
const strategy = require("../../config/config-passport");
require("dotenv").config();
let token;

const router = express.Router();
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

router.post("/users/signup", async (req, res, next) => {
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
		res.status(201).json({
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
});

router.post("/users/login", async (req, res, next) => {
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
		return res.json({
			status: "success",
			code: 200,
			data: {
				token: token,
				user: {
					email: email,
					subscription: "starter",
				},
			},
		});
	} catch {
		return res.json({
			status: "Bad request",
			code: 400,
			message: "Login failed",
		});
	}
});

router.get("/users/logout", auth, async (req, res, next) => {
	const { id } = req.user;
	const user = await User.findOne({ id });
	if (user) {
		return res.json({
			code: 204,
			status: "Logged out",
		});
	}
	return res.json({
		status: "Unauthorized",
		code: 401,
		ResponseBody: {
			message: "Not authorized",
		},
	});
});

router.get("/users/current", auth, async (req, res, next) => {
	try {
		console.log("token", token);
		const { id } = jwt.decode(token);
		const user = await User.findOne({ id });
		if (user) {
			return res.json({
				code: 200,
				status: OK,
				ResponseBody: {
					email: "example@example.com",
					subscription: "starter",
				},
			});
		}
		return res.json({
			code: 400,
			Status: "Unauthorized",
			ContentType: application / json,
			ResponseBody: {
				message: "Bad request",
			},
		});
	} catch (err) {
		res.json({
			status: "Unauthorized",
			code: 401,
			ResponseBody: {
				message: "Not authorized",
			},
		});
	}
});

module.exports = router;
