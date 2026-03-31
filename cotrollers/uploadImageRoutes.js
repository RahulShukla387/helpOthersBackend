
import path from "path";
import multer from "multer";
import fs from "fs-extra";
import cloudinary from "../config/Cloudinary.js";
import { Upload } from "../models/Upload.js";
import ReportIssue from "../models/ReportIssue.js";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'C:/Users/ASUS/OneDrive/Desktop/css project/AdiYuvanBackend/routes/uploads');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     const ext = path.extname(file.originalname); // .jpg / .png / .jpeg
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   }
// })
  
const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await fs.ensureDir(uploadDir); 
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

export const upload = multer({ storage: storage })
  
//todo Uploading the image on cloudinary for showAll 
   
export const uploadImage = async (req, res) => {
  try {
    console.log("working 1");

    const imagePath = req.file.path.replace(/\\/g, "/");

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "AdiYuvanNgoBackend",
    });

    console.log("working 2");
    console.log(result);
    let toAdd = {
      public_id:result.public_id,
      url:result.url,
      secure_url:result.secure_url,
      original_filename:result.original_filename,

    }
    let addedValue = await Upload.create(toAdd);
    console.log("After uploading result is : ", addedValue);
    // console.log("Cloudinary path is:", result.secure_url);
      
       // Delete local file (fs-extra)
    await fs.remove(imagePath);
    console.log("Local file removed successfully", imagePath);

    res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
    });

  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}


//todo VolunteerReportIssue image 

export const VolunteerReportImage = async (req, res) => {
  console.log("req file is ", req.file , "req body is ", req.body);
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: "Image is required",
      });
    }

    const {
      title,
      description,
      latitude,
      longitude,
      locationTime,
      accuracy,
      imageTime,
    } = req.body;

    if (
      !title ||
      !description ||
      latitude === undefined ||
      longitude === undefined ||
      accuracy === undefined ||
      locationTime === undefined ||
      imageTime === undefined
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

   if (Number(accuracy) > 2000) {
  return res.json({
    success: false,
    message: "Location accuracy too low",
  });
}

if (Math.abs(Number(imageTime) - Number(locationTime)) > 60000) {
  return res.json({
    success: false,
    message: "Image must be captured within 1 minute of location access",
  });
}


    const imagePath = req.file.path.replace(/\\/g, "/");

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "AdiYuvanNgoVolunteer",
    });

    const issue = await ReportIssue.create({
      title,
      description,
      image: result.secure_url,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy),
      locationTime: Number(locationTime),
      imageTime: Number(imageTime),
    });

    await fs.remove(imagePath);

    return res.json({
      success: true,
      message: "Report submitted successfully",
      data: issue,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};