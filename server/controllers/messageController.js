const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

exports.getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ participants:req.user._id })
      .populate("participants","name avatar role isVerified")
      .populate("relatedGig","title")
      .sort("-lastMessageAt");
    res.json({ success:true, conversations:convs });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.createOrGetConversation = async (req, res) => {
  try {
    const { recipientId, gigId } = req.body;
    const uid = req.user._id.toString();
    let conv = await Conversation.findOne({ participants:{ $all:[uid, recipientId] } })
      .populate("participants","name avatar role isVerified");
    if (!conv) {
      conv = await Conversation.create({ participants:[uid, recipientId], relatedGig:gigId||null, unreadCount:{ [uid]:0, [recipientId]:0 } });
      conv = await Conversation.findById(conv._id).populate("participants","name avatar role isVerified");
    }
    res.json({ success:true, conversation:conv });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const uid = req.user._id.toString();
    const conv = await Conversation.findOne({ _id:req.params.convId, participants:req.user._id });
    if (!conv) return res.status(403).json({ success:false, message:"Access denied" });
    const messages = await Message.find({ conversationId:req.params.convId })
      .populate("sender","name avatar")
      .sort("createdAt");
    await Message.updateMany({ conversationId:req.params.convId, sender:{ $ne:req.user._id }, isRead:false }, { isRead:true });
    const uc = conv.unreadCount ? Object.fromEntries(conv.unreadCount) : {};
    uc[uid] = 0;
    conv.unreadCount = uc;
    await conv.save();
    res.json({ success:true, messages });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success:false, message:"Message cannot be empty" });
    const uid = req.user._id.toString();
    const conv = await Conversation.findOne({ _id:req.params.convId, participants:req.user._id });
    if (!conv) return res.status(403).json({ success:false, message:"Access denied" });
    const msg = await Message.create({ conversationId:req.params.convId, sender:req.user._id, text:text.trim() });
    const populated = await Message.findById(msg._id).populate("sender","name avatar");
    const otherId = conv.participants.find(p => p.toString() !== uid)?.toString();
    const uc = conv.unreadCount ? Object.fromEntries(conv.unreadCount) : {};
    uc[otherId] = (uc[otherId]||0) + 1;
    conv.lastMessage = text.trim().slice(0,80);
    conv.lastMessageAt = new Date();
    conv.unreadCount = uc;
    await conv.save();
    res.status(201).json({ success:true, message:populated });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const uid = req.user._id.toString();
    const convs = await Conversation.find({ participants:req.user._id });
    const total = convs.reduce((s,c) => { const uc = c.unreadCount ? Object.fromEntries(c.unreadCount) : {}; return s+(uc[uid]||0); }, 0);
    res.json({ success:true, count:total });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};
