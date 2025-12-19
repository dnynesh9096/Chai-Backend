import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    console.log("Cookies:", req.cookies);
    console.log("Auth Header:", req.header("Authorization"));

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select("-password -refresh")

    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user;
    next()

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
})

export const optionalVerifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return next()
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refresh")

    if (user) {
      req.user = user
    }
    next()
  } catch (error) {
    // Just proceed if token is invalid, don't throw error
    next()
  }
})