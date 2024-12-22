import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
      required: true,
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("Notification", notificationSchema);
// export the model
export default notificationModel;
