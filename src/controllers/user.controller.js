import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/couldinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    
    const {fullName, email, username, password }= req.body
    console.log("email: ", email);

    if(
        [fullName, email, username, password].some((field) =>
        field?.trim() ==="")
    ){
        throw new ApiError(400, "All field are required")
    }

    const exitedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(exitedUser){
        throw new ApiError(409, "User with or  username already exited ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    coverImageLocalPath = req.fieles?.coverimage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
         throw new ApiError(400, "avatar file is required")
    }

   const user = await User.create({
        fulname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createsUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser }
