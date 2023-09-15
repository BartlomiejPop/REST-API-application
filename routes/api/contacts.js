const express = require("express");
const ctrlContact = require("../../controller/contacts");
require("dotenv").config();
const ctrlAuth = require("../../controller/auth");
const multer = require("multer");
const path = require("path");
const uploadDir = path.join(process.cwd(), "uploads");
const storeImage = path.join(process.cwd(), "images");
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

const router = express.Router();

router.get("/", ctrlAuth.auth, ctrlContact.get);

router.get("/:id", ctrlAuth.auth, ctrlContact.getById);

router.post("/", ctrlAuth.auth, ctrlContact.create);

router.delete("/:id", ctrlAuth.auth, ctrlContact.remove);

router.put("/:id", ctrlAuth.auth, ctrlContact.update);

router.patch("/:id/favorite", ctrlAuth.auth, ctrlContact.patch);

module.exports = router;
