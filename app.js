const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");
const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "images");
const passport = require("./config/config-passport");
const contactsRouter = require("./routes/api/contacts");
const authRouter = require("./routes/api/auth");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

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

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api", authRouter);

app.use(passport.initialize());
app.use(express.static("public"));

app.use((_, res) => {
	res.status(404).json({ message: "Not found" });
});

app.use((err, _, res) => {
	res.status(500).json({ message: err.message });
});

const connection = mongoose.connect(
	"mongodb+srv://Bartek:123@cluster0.uepqqcq.mongodb.net/",
	{
		dbName: "contacts",
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

connection
	.then(() => {
		app.listen(function () {
			console.log("Database connection successful");
		});
	})
	.catch((err) => {
		console.log(`Server not running. Error message: ${err.message}`);
		process.exit(1);
	});

const isAccessible = (path) => {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
	if (!(await isAccessible(folder))) {
		await fs.mkdir(folder);
	}
};

// app.listen(3000, async () => {
// 	createFolderIsNotExist(uploadDir);
// 	createFolderIsNotExist(storeImage);
// 	console.log(`Server running. Use on port: 3000`);
// });

module.exports = app;
