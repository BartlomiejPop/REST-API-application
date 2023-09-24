const app = require("./app");
const path = require("path");
const fs = require("fs").promises;

const uploadDir = path.join(process.cwd(), "tmp");

const isAccessible = (path) => {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
	if (!(await isAccessible(folder))) {
		await fs.mkdir(folder, { recursive: true });
	}
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	createFolderIsNotExist(uploadDir);
	createFolderIsNotExist("public");
	createFolderIsNotExist("public/avatars");
	console.log(`Server running. Use on port:${PORT}`);
});
