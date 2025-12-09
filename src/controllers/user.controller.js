import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Token generation failed");
    }
};



const registerUser = asyncHandler(async (req, res) => {
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

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is reqired")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    const response = new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },

        "User logged In Successfully"

    )
    console.log("SENDING RESPONSE:", JSON.stringify(response, null, 2))

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(response)

})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}
