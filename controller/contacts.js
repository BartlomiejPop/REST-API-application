const service = require("../service/index");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "uploads");
const storeImage = path.join(process.cwd(), "images");
const fs = require("fs");
const Jimp = require("jimp");
const User = require("../service/schemas/user");
require("dotenv").config();

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

const avatar = async (req, res, next) => {
	const { description } = req.body;
	const { path: temporaryName, originalname } = req.file;
	const fileName = path.join(storeImage, originalname);
	try {
		await fs.rename(temporaryName, fileName);
	} catch (err) {
		await fs.unlink(temporaryName);
		return next(err);
	}
	res.json({
		description,
		message: "Plik załadowany pomyślnie",
		status: 200,
	});
};

const isAccessible = (path) => {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
	if (!(await isAccessible(folder))) {
		await fs.mkdir(folder);
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
