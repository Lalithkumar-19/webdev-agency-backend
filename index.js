const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose, model } = require("mongoose");
app.use(cors());
// Middleware for parsing JSON bodies
app.use(express.json());
const PORT = process.env.PORT || 5000;
// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server!" });
});

mongoose.connect(process.env.mongodb_url).then(() => {
  console.log("connected to mongodb");
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  url: { type: String, required: true },
  tags: [{ type: String, required: true }],
  category: { type: String, required: true },
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  project_brief: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { type: Boolean, default: false },
});
const Projects = model("projects", projectSchema);
const Contacts = model("Contacts", contactSchema);

app.post("/api/projects", async (req, res) => {
  try {
    const { title, description, img, url, tags, category } = req.body;
    const newproject = new Projects({
      description,
      img,
      url,
      title,
      tags,
      category,
    });
    await newproject.save();
    res.status(200).json("uploaded successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const AllProjects = await Projects.find();
    res.status(200).json(AllProjects);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.delete("/api/projects", async (req, res) => {
  try {
    const id = req.query;
    await Projects.findByIdAndDelete(id);
    res.status(200).json("deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, phone, project_brief, budget } = req.body;
    const newContacts = new Contacts({
      name,
      email,
      phone,
      project_brief,
      budget,
    });
    await newContacts.save();
    res.status(200).json("successfuly submitted");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.get("/api/contacts", async (req, res) => {
  try {
    const Allcontacts = await Contacts.find();
    res.status(200).json(Allcontacts);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
