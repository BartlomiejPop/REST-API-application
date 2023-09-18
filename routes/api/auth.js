const express = require("express");
require("dotenv").config();

const router = express.Router();
const app = express();
const ctrlAuth = require("../../controller/auth");
const ctrlContact = require("../../controller/contacts");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "tmp");
const fs = require("fs").promises;
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

const isAccessible = (path) => {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
	if (!(await isAccessible(folder))) {
		await fs.mkdir(folder, { recursive: true });
	}
};

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
	createFolderIsNotExist(uploadDir);
	createFolderIsNotExist("public");
	createFolderIsNotExist("public/avatars");
	console.log(`Server running. Use on port:${PORT}`);
});

router.post("/users/signup", ctrlAuth.signup);

router.post("/users/login", ctrlAuth.login);

router.get("/users/logout", ctrlAuth.auth, ctrlAuth.logout);

router.get("/users/current", ctrlAuth.auth, ctrlAuth.current);

router.patch(
	"/users/avatars",
	upload.single("picture"),
	ctrlAuth.auth,
	ctrlContact.avatar
);

module.exports = router;
