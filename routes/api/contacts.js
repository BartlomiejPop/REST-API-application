const express = require("express");
const ctrlContact = require("../../controller/contacts");
require("dotenv").config();
const ctrlAuth = require("../../controller/auth");

const router = express.Router();

router.get("/", ctrlAuth.auth, ctrlContact.get);

router.get("/:id", ctrlAuth.auth, ctrlContact.getById);

router.post("/", ctrlAuth.auth, ctrlContact.create);

router.delete("/:id", ctrlAuth.auth, ctrlContact.remove);

router.put("/:id", ctrlAuth.auth, ctrlContact.update);

router.patch("/:id/favorite", ctrlAuth.auth, ctrlContact.patch);

module.exports = router;
