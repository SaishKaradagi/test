// models/Community.js
import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
  members: [{ type: String }], // Store member usernames/emails
  createdAt: { type: Date, default: Date.now },
});

export const Community = mongoose.model("Community", communitySchema);
