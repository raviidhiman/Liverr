const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

const P = "name avatar role";

exports.getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user._id })
      .populate("participants", P).populate("relatedGig", "title").sort("-lastMessageAt");
    res.json({ success: true, conversations: convs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createOrGetConversation = async (req, res) => {
  try {
    const { recipientId, gigId } = req.body;
    const uid = req.user._id.toString();
    if (!recipientId || recipientId === uid) return res.status(400).json({ success: false, message: "You cannot message yourself" });
    if (!(await User.exists({ _id: recipientId }))) return res.status(404).json({ success: false, message: "User not found" });
    let conv = await Conversation.findOne({ participants: { $all: [uid, recipientId], $size: 2 } });
    if (!conv) conv = await Conversation.create({ participants: [uid, recipientId], relatedGig: gigId || null });
    conv = await Conversation.findById(conv._id).populate("participants", P).populate("relatedGig", "title");
    res.json({ success: true, conversation: conv });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const uid = req.user._id.toString();
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: req.user._id });
    if (!conv) return res.status(403).json({ success: false, message: "Access denied" });
    const messages = await Message.find({ conversationId: conv._id }).populate("sender", "name avatar").sort("createdAt").limit(500);
    await Message.updateMany({ conversationId: conv._id, sender: { $ne: req.user._id }, isRead: false }, { isRead: true });
    if ((conv.unreadCount.get(uid) || 0) > 0) { conv.unreadCount.set(uid, 0); await conv.save(); }
    res.json({ success: true, messages });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ success: false, message: "Message cannot be empty" });
    const uid = req.user._id.toString();
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: req.user._id });
    if (!conv) return res.status(403).json({ success: false, message: "Access denied" });
    const msg = await Message.create({ conversationId: conv._id, sender: req.user._id, text: text.slice(0, 2000) });
    const otherId = conv.participants.find((p) => p.toString() !== uid).toString();
    conv.unreadCount.set(otherId, (conv.unreadCount.get(otherId) || 0) + 1);
    conv.lastMessage = text.slice(0, 80);
    conv.lastMessageAt = new Date();
    await conv.save();
    res.status(201).json({ success: true, message: await Message.findById(msg._id).populate("sender", "name avatar") });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const uid = req.user._id.toString();
    const convs = await Conversation.find({ participants: req.user._id }).select("unreadCount");
    res.json({ success: true, count: convs.reduce((s, c) => s + (c.unreadCount.get(uid) || 0), 0) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
