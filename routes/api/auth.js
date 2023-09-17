const express = require("express");
require("dotenv").config();

const router = express.Router();
const ctrlAuth = require("../../controller/auth");
const ctrlContact = require("../../controller/contacts");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "avatars");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "/tmp");
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
