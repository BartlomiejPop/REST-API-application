const service = require("../service/index");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");
const User = require("../service/schemas/user");
require("dotenv").config();

const get = async (_, res, next) => {
	try {
		const results = await service.getAllContacts();
		res.json({
			status: "success",
			code: 200,
			data: {
				contacts: results,
			},
		});
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const getById = async (req, res, next) => {
	const { id } = req.params;
	try {
		console.log(id);
		const result = await service.getContactById(id);
		if (result) {
			res.json({
				status: "success",
				code: 200,
				data: { contact: result },
			});
		} else {
			res.status(404).json({
				status: "error",
				code: 404,
				message: `Not found contact id: ${id}`,
				data: "Not Found",
			});
		}
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const create = async (req, res, next) => {
	const { name, email, phone, favourite } = req.body;
	try {
		const result = await service.createContact({
			name,
			email,
			phone,
			favourite,
		});

		res.status(201).json({
			status: "success",
			code: 201,
			data: { contact: result },
		});
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const update = async (req, res, next) => {
	const { id } = req.params;
	const { name, email, phone, favorite } = req.body;
	try {
		const result = await service.updateContact(id, {
			name,
			email,
			phone,
			favorite,
		});
		if (result) {
			res.json({
				status: "success",
				code: 200,
				data: { contact: result },
			});
		} else {
			res.status(404).json({
				status: "error",
				code: 404,
				message: `Not found contact id: ${id}`,
				data: "Not Found",
			});
		}
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const remove = async (req, res, next) => {
	const { id } = req.params;

	try {
		const result = await service.removeContact(id);
		if (result) {
			res.json({
				status: "success",
				code: 200,
				data: { contact: result },
			});
		} else {
			res.status(404).json({
				status: "error",
				code: 404,
				message: `Not found contact id: ${id}`,
				data: "Not Found",
			});
		}
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const patch = async (req, res, next) => {
	const { id } = req.params;
	const { favorite } = req.body;
	try {
		const result = await service.updateStatusContact(id, { favorite });
		if (result) {
			res.json({
				status: "success",
				code: 200,
				data: { contact: result },
			});
		} else {
			res.status(404).json({
				status: "error",
				code: 404,
				message: `Not found`,
			});
		}
	} catch (e) {
		console.error(e);
		next(e);
	}
};

const avatar = async (req, res) => {
	try {
		const { file } = req;
		const { id } = req.user;

		if (!file) {
			return res.status(400).json({
				status: "Bad Request",
				message: "Avatar file is required.",
			});
		}
		const tmpDir = path.join(__dirname, "..", "tmp");
		const avatarsDir = path.join(__dirname, "..", "public", "avatars");
		const uniqueFileName = `${Date.now()}-${file.originalname}`;
		const tmpFilePath = path.join(tmpDir, uniqueFileName);
		const avatarFilePath = path.join(avatarsDir, uniqueFileName);
		const avatar = await Jimp.read(file.path);
		avatar.resize(250, 250).quality(80);
		await avatar.writeAsync(tmpFilePath);
		fs.renameSync(tmpFilePath, avatarFilePath);
		const user = await User.findByIdAndUpdate(id, {
			avatarURL: `/avatars/${uniqueFileName}`,
		});

		if (!user) {
			return res.status(404).json({
				status: "Not Found",
				message: "User not found.",
			});
		}

		res.status(200).json({
			status: "success",
			data: {
				message: "Avatar updated successfully.",
				avatarURL: `/avatars/${uniqueFileName}`,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "Internal Server Error",
			message: "Avatar update failed.",
			error: error.message,
		});
	}
};

module.exports = {
	get,
	getById,
	create,
	update,
	remove,
	patch,
	avatar,
};
