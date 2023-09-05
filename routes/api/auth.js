const express = require("express");
require("dotenv").config();

const router = express.Router();
const ctrlAuth = require("../../controller/auth");

router.post("/users/signup", ctrlAuth.signup);

router.post("/users/login", ctrlAuth.login);

router.get("/users/logout", ctrlAuth.auth, ctrlAuth.logout);

router.get("/users/current", ctrlAuth.auth, ctrlAuth.current);

module.exports = router;
