import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // validation
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // uploaded files
    const avatarFile = req.files?.avatar?.[0];
    const coverFile = req.files?.coverImage?.[0];

    if (!avatarFile) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload
    let avatarUrl, coverUrl;
    try {
        avatarUrl = await uploadOnCloudinary(avatarFile.path);
        coverUrl = coverFile ? await uploadOnCloudinary(coverFile.path) : null;
    } catch (error) {
        // Return the specific error from Cloudinary (e.g., config error)
        throw new ApiError(500, error.message || "Error uploading files to Cloudinary");
    }

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar: avatarUrl,
        coverImage: coverUrl,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User registered successfully"));
});
