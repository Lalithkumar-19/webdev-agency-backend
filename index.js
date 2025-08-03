const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose, model, Mongoose } = require("mongoose");
app.use(cors());
require("dotenv").config();
// Middleware for parsing JSON bodies
app.use(express.json());
const PORT = process.env.PORT || 5000;
const JWT = require("jsonwebtoken");
const verifyToken = require("./admin-middleware");

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
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const admins = model("admins", adminSchema);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await Projects.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const projects = await Projects.find()
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      projects,
      totalCount: count,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.get("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const project = await Projects.findById(id);
    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.delete("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await Projects.findByIdAndDelete(id);
    res.status(200).json("deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.put("/api/projects/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await Projects.findByIdAndUpdate(id, { $set: req.body });
    res.status(200).json("updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

// Contact API endpoints
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

app.get("/api/contacts", verifyToken, async (req, res) => {
  try {
    const Allcontacts = await Contacts.find();
    res.status(200).json(Allcontacts);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});
app.get("/api/contacts/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const contact = await Contacts.findById(id);
    res.status(200).json(contact);
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.patch("/api/contacts/:id/status", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const contact = await Contacts.findById(id);
    contact.status = !contact.status;
    await contact.save();
    res.status(200).json("status updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

app.delete("/api/contacts/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await Contacts.findByIdAndDelete(id);
    res.status(200).json("deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("internal server error occured");
  }
});

//us
//
//
//
// er api
app.get("/api/filters", async (req, res) => {
  try {
    // Get unique categories
    const IndustryFilters = await Projects.distinct("category");

    // Get unique tags (used as tech stacks)
    const allTags = await Projects.find({}, "tags");

    const techStackSet = new Set();
    allTags.forEach((project) => {
      project.tags.forEach((tag) => techStackSet.add(tag));
    });

    const TechStacksFilters = Array.from(techStackSet);

    res.status(200).json({ IndustryFilters, TechStacksFilters });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
});

app.get("/api/projects/v1/filtered", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 8, 
      category, 
      tags, 
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const validTags = tagArray.filter(tag => tag !== 'All');
      if (validTags.length > 0) {
        filter.tags = { $in: validTags };
      }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get projects with pagination
    const projects = await Projects.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Get total count for pagination
    const totalCount = await Projects.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      projects,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    });
  } catch (error) {
    console.error("Error fetching filtered projects:", error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
});

// admin routes

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json("missing some credentials");
    }
    const admin = admins.find({ email, password });
    if (!admin) {
      res.status(403).json("Unauthorized access");
      return;
    }
    const token = JWT.sign(req.body, process.env.SECRET);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ message: "Internal server error occurred" });
  }
});

// app.get("")

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
