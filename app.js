const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const contactsRouter = require("./routes/api/contacts");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

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

module.exports = app;
