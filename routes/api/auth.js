const express = require("express");
require("dotenv").config();
const upload = require("../../controller/Mailer");
const router = express.Router();
const ctrlAuth = require("../../controller/auth");
const ctrlContact = require("../../controller/contacts");

router.post("/users/signup", ctrlAuth.signup);

router.post("/users/login", ctrlAuth.login);

router.get("/users/logout", ctrlAuth.auth, ctrlAuth.logout);

router.get("/users/current", ctrlAuth.auth, ctrlAuth.current);

router.patch(
	"/users/avatars",
	upload.upload.single("picture"),
	ctrlAuth.auth,
	ctrlContact.avatar
);

router.get("/users/verify/:verificationToken", ctrlAuth.verification);

router.post("/users/verify", ctrlAuth.verify);

module.exports = router;
