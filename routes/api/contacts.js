const express = require("express");
const ctrlContact = require("../../controller");

const router = express.Router();

router.get("/", ctrlContact.get);

router.get("/:id", ctrlContact.getById);

router.post("/", ctrlContact.create);

router.delete("/:id", ctrlContact.remove);

router.put("/:id", ctrlContact.update);

router.patch("/:id/favorite", ctrlContact.patch);

module.exports = router;
