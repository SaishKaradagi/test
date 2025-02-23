import { Community } from "../models/Community.js";
import { Channel } from "../models/Channel.js";
import { Message } from "../models/Message.js";

export const communityController = {
  // Get all communities
  getAllCommunities: async (req, res) => {
    try {
      const communities = await Community.find()
        .select("-messages")
        .populate("channels", "name description");
      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single community
  getCommunity: async (req, res) => {
    try {
      const community = await Community.findById(req.params.id)
        .populate("channels")
        .populate("members", "username role");
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new community
  createCommunity: async (req, res) => {
    try {
      const { name, description, category } = req.body;
      const community = new Community({
        name,
        description,
        category,
        members: [req.user._id], // Assuming you have user auth
      });

      // Create default channels
      const channels = [
        { name: "general", description: "General discussion" },
        { name: "introductions", description: "Introduce yourself" },
      ];

      const createdChannels = await Promise.all(
        channels.map((channel) =>
          new Channel({
            ...channel,
            community: community._id,
          }).save()
        )
      );

      community.channels = createdChannels.map((channel) => channel._id);
      await community.save();

      res.status(201).json(community);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Join community
  joinCommunity: async (req, res) => {
    try {
      const community = await Community.findById(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      if (!community.members.includes(req.user._id)) {
        community.members.push(req.user._id);
        await community.save();
      }

      res.json({ message: "Joined community successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get channel messages
  getChannelMessages: async (req, res) => {
    try {
      const messages = await Message.find({ channel: req.params.channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "username");
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
