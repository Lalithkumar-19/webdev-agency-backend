const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose, model } = require("mongoose");
app.use(cors());
// Middleware for parsing JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server!" });
});

mongoose
  .connect(
    "mongodb+srv://lalithdev123:lalith1234@cluster0.q2ldpuo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
  )
  .then(() => {
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
const Projects = model("projects", projectSchema);

app.post("/upload-project", async (req, res) => {
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
}).get(()=>{
  try {
    
  } catch (error) {
    
  }
})
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
