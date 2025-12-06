import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
    // Check for invalid configuration immediately
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'chai') {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
        throw new Error("Invalid CLOUDINARY_CLOUD_NAME. Please check your .env file.");
    }

    if (!filePath) return null;

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
            folder: "chaior/users",
            transformation: [
                { width: 800, height: 800, crop: "fill" }
            ],
        });

        // File uploaded successfully, remove local file
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.log("Error deleting local file after upload:", error);
        }

        return uploadResult.secure_url;
    } catch (err) {
        // Remove local file if upload failed
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.log("Error deleting local file after failed upload:", error);
        }

        console.error("Cloudinary Upload Error Details:", err); // Log full error

        // Re-throw the error with more details
        const errorMessage = err.message || JSON.stringify(err);
        throw new Error(`Cloudinary Upload Failed: ${errorMessage}`);
    }
};
