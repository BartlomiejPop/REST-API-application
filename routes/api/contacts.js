const express = require("express");
const contactFunctions = require("../../models/contacts");
const Joi = require("joi");

const router = express.Router();

router.get("/", async (req, res) => {
	const contacts = await contactFunctions.getContacts();
	res.json({ status: "success", code: 200, data: contacts });
});

router.get("/:contactId", async (req, res) => {
	const { contactId } = req.params;
	const contact = await contactFunctions.getContactById(contactId);
	if (contact) {
		res.json({ status: "success", code: 200, data: contact });
	} else {
		res.json({ message: "Not found" });
	}
});

router.post("/", async (req, res) => {
	const schema = Joi.object({
		id: Joi.number(),
		name: Joi.string().alphanum().min(3).max(30).required(),
		email: Joi.string()
			.required()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ["com", "net"] },
			}),
		phone: Joi.string().required(),
	});
	const { name, email, phone } = req.body;
	try {
		const contact = await schema.validateAsync({
			id: `${Math.floor(Math.random() * 5001)}`,
			name: name,
			email: email,
			phone: phone,
		});
		contactFunctions.addContact(contact);
		res.status(201).json({
			status: "success",
			code: 201,
			data: { contact },
		});
	} catch (err) {
		res
			.status(400)
			.json({ message: "missing required field or field is invalid" });
		return;
	}
});

router.delete("/:contactId", async (req, res) => {
	const { contactId } = req.params;
	const response = await contactFunctions.removeContact(contactId);
	if (response.message === "Not found") {
		res.status(404).json({ message: "Not found" });
	} else {
		res.status(200).json({ message: "contact deleted" });
	}
});

router.put("/:contactId", async (req, res) => {
	const schema = Joi.object({
		name: Joi.string().alphanum().min(3).max(30),
		email: Joi.string().email({
			minDomainSegments: 2,
			tlds: { allow: ["com", "net"] },
		}),
		phone: Joi.string(),
	});
	const { contactId } = req.params;
	const body = req.body;
	try {
		const contact = await schema.validateAsync(body);
		if (Object.keys(body).length === 0) {
			res.status(400).json({ message: "missing fields" });
			return;
		}
		const response = await contactFunctions.updateContact(contactId, contact);
		if (response === "Not found") {
			res.status(404).json({ message: "Not found" });
		} else {
			res.status(200).json({ actualizedContact: response });
		}
	} catch (err) {
		res.status(422).json({ message: "invalid input" });
	}
});

module.exports = router;
