const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "/contacts.json");
const saveFile = async (file) =>
	await fs.writeFile(contactsPath, JSON.stringify(file, null, 2), "utf8");

const getContacts = async () => {
	try {
		const data = await fs.readFile(contactsPath);
		return JSON.parse(data);
	} catch (err) {
		console.log(err.message);
	}
};

const getContactById = async (contactId) => {
	try {
		const data = await getContacts();
		const contact = data.find((el) => el.id === contactId);
		return contact;
	} catch (err) {
		console.log(err.message);
	}
};

const removeContact = async (contactId) => {
	const contactList = await getContacts();
	const newContacts = contactList.filter((el) => el.id !== contactId);
	if (newContacts.length < contactList.length) {
		saveFile(newContacts);
		return { message: "contact deleted" };
	} else {
		return { message: "Not found" };
	}
};

const addContact = async (contact) => {
	const contactList = await getContacts();
	contactList.push(contact);
	saveFile(contactList);
	console.log(`contact added`);
};

const updateContact = async (contactId, body) => {
	const contactList = await getContacts();
	const contactIndex = contactList.findIndex(
		(contact) => contact.id === contactId
	);
	if (contactIndex !== -1) {
		contactList[contactIndex] = {
			id: contactList[contactIndex].id,
			name: body.name ? body.name : contactList[contactIndex].name,
			email: body.email ? body.email : contactList[contactIndex].email,
			phone: body.phone ? body.phone : contactList[contactIndex].phone,
		};
		saveFile(contactList);
		return contactList[contactIndex];
	} else {
		return { message: "Not found" };
	}
};

module.exports = {
	getContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
