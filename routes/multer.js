const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid"); // Import uuidv4 to generate unique IDs
const path = require("path"); // Import path to handle file extensions

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Set up the Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Specify the folder in Cloudinary where the images will be uploaded
    allowedFormats: ["png", "jpg", "jpeg"], // Define allowed formats
    filename: (req, file) => {
      const uniqueName = uuidv4(); // Generate a unique filename using UUID
      return uniqueName + path.extname(file.originalname); // Return the file name with extension
    },
  },
});

// Create the upload middleware using multer with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload;
