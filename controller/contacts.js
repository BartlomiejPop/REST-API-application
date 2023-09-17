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
	try {
		console.log("test");
		const { token } = req.user;
		const { file } = req;

		if (!file) {
			return res.status(400).json({
				status: "Bad Request",
				message: "Avatar file is required.",
			});
		}

		// Tworzenie ścieżki do folderu tmp i folderu avatars w public
		const tmpDir = path.join(__dirname, "..", "tmp");
		const avatarsDir = path.join(__dirname, "..", "public", "avatars");

		// Tworzenie unikalnej nazwy pliku
		const uniqueFileName = `${Date.now()}-${file.originalname}`;

		// Ścieżka do tymczasowego pliku
		const tmpFilePath = path.join(tmpDir, uniqueFileName);

		// Ścieżka do docelowego pliku w folderze avatars
		const avatarFilePath = path.join(avatarsDir, uniqueFileName);
		console.log(tmpFilePath);

		// Odczyt awatara za pomocą Jimp i przetworzenie go na wymiary 250x250
		// console.log(await Jimp.read(file.path));
		// const avatar = await Jimp.read(file.path);

		// await avatar.resize(250, 250).quality(80);

		// // Zapisz przetworzony awatar do folderu tmp
		// await avatar.writeAsync(tmpFilePath);

		// Przenieś awatar do folderu public/avatars
		fs.renameSync(tmpFilePath, avatarFilePath);

		// Aktualizuj pole avatarURL w bazie danych
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
