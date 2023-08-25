const Contact = require("./schemas/contact");

const getAllContacts = async () => {
	return Contact.find();
};

const getContactById = (id) => {
	return Contact.findOne({ _id: id });
};

const createContact = ({ name, email, phone, favourite }) => {
	return Contact.create({ name, email, phone, favourite });
};

const updateContact = (id, fields) => {
	console.log(fields);
	return Contact.findByIdAndUpdate({ _id: id }, fields, { new: true });
};

const removeContact = (id) => {
	return Contact.findByIdAndRemove({ _id: id });
};

const updateStatusContact = (id, field) => {
	console.log(field);
	return Contact.findByIdAndUpdate({ _id: id }, field, { new: true });
};

module.exports = {
	getAllContacts,
	getContactById,
	createContact,
	updateContact,
	removeContact,
	updateStatusContact,
};
