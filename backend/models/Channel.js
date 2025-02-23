// models/Channel.js
import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const Channel = mongoose.model("Channel", channelSchema);
