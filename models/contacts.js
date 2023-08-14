const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "/contacts.json");

const listContacts = async () => {
	try {
		const data = await fs.readFile(contactsPath);
		return data.toString();
	} catch (err) {
		console.log(err.message);
	}
};

const getContactById = async (contactId) => {
	try {
		const data = await fs.readFile(contactsPath);
		const parsedData = JSON.parse(data);
		const contact = parsedData.filter((el) => el.id === contactId);
		return contact;
	} catch (err) {
		console.log(err.message);
	}
};

const removeContact = async (contactId) => {
	const contactList = await fs.readFile(contactsPath);
	const parsedContactList = JSON.parse(contactList);
	const contactIndex = parsedContactList.findIndex(
		(contact) => contact.id === contactId
	); // Find the index of the contact with the given ID
	if (contactIndex !== -1) {
		parsedContactList.splice(contactIndex, 1); // Remove the contact from the array
		await fs.writeFile(
			contactsPath,
			JSON.stringify(parsedContactList, null, 2),
			"utf8"
		);
		return { message: "contact deleted" };
	} else {
		return { message: "Not found" };
	}
};

const addContact = async (contact) => {
	const contactList = await fs.readFile(contactsPath);
	const parsedContactList = JSON.parse(contactList);
	parsedContactList.push(contact);
	await fs.writeFile(
		contactsPath,
		JSON.stringify(parsedContactList, null, 2),
		"utf8"
	); // Save the changes
	console.log(`contact added`);
};

const updateContact = async (contactId, body) => {
	const contactList = await fs.readFile(contactsPath);
	const parsedContactList = JSON.parse(contactList);
	const contactIndex = parsedContactList.findIndex(
		(contact) => contact.id === contactId
	); // Find the index of the contact with the given ID
	if (contactIndex !== -1) {
		parsedContactList[contactIndex] = {
			id: parsedContactList[contactIndex].id,
			name: body.name ? body.name : parsedContactList[contactIndex].name,
			email: body.email ? body.email : parsedContactList[contactIndex].email,
			phone: body.phone ? body.phone : parsedContactList[contactIndex].phone,
		}; //check for incoming values and overwrite the previous
		await fs.writeFile(
			contactsPath,
			JSON.stringify(parsedContactList, null, 2),
			"utf8"
		); // Save the changes
		return parsedContactList[contactIndex];
	} else {
		return { message: "Not found" };
	}
};

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
