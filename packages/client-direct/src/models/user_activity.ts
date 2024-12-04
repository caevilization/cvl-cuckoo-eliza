import mongoose from "mongoose";

export enum ActivityType {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
}

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(ActivityType),
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
