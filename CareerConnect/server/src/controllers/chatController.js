const mongoose = require('mongoose');

// Utility to get the user ID from the token
function getUserId(req) {
    return req.user._id;
}

// 1. Start a new chat
async function createChat(req, res) {
    const Chat = mongoose.model('Chat');
    const { partnerId, jobId, referenceId } = req.body; 

    if (!partnerId || (!jobId && !referenceId)) {
        return res.status(400).json({ message: 'Partner ID and either jobId or referenceId are required.' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ message: 'Invalid partnerId format.' });
        }

        const userObjId = new mongoose.Types.ObjectId(getUserId(req));
        const partnerObjId = new mongoose.Types.ObjectId(partnerId);
        const participantsArr = [userObjId, partnerObjId];

        // Build query depending on whether this is a job chat or reference chat
        let query = { participants: { $all: participantsArr } };
        if (jobId) {
            if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).json({ message: 'Invalid jobId format.' });
            query.job = new mongoose.Types.ObjectId(jobId);
        } else if (referenceId) {
            if (!mongoose.Types.ObjectId.isValid(referenceId)) return res.status(400).json({ message: 'Invalid referenceId format.' });
            query.reference = new mongoose.Types.ObjectId(referenceId);
        }

        let chat = await Chat.findOne(query);
        if (chat) return res.status(200).json(chat);

        const createPayload = { participants: participantsArr, messages: [] };
        if (jobId) createPayload.job = new mongoose.Types.ObjectId(jobId);
        if (referenceId) createPayload.reference = new mongoose.Types.ObjectId(referenceId);

        chat = await Chat.create(createPayload);
        console.debug('[createChat] created chat', { chatId: chat._id.toString(), participants: participantsArr.map(p => p.toString()) });
        return res.status(201).json(chat);

    } catch (error) {
        console.error('[createChat] error:', error);
        return res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
}

// 2. Get a list of all chats for the logged-in user
async function getChats(req, res) {
    const Chat = mongoose.model('Chat');
    const userId = getUserId(req);

    try {
        let chats = await Chat.find({ participants: userId })
            .populate('participants', 'name email role company') 
            .populate('job', 'title company') 
            .populate({ 
                path: 'job', 
                populate: { path: 'company', select: 'name' } 
            })
        .populate({ path: 'reference', select: 'title author', populate: { path: 'author', select: 'name role' } })
            .sort({ updatedAt: -1 }); 

        // Enrich participant objects with avatar URLs where possible
        const CandidateProfile = mongoose.model('CandidateProfile');
        const Company = mongoose.model('Company');
        chats = await Promise.all(chats.map(async c => {
            const parts = await Promise.all((c.participants || []).map(async p => {
                const part = p.toObject ? p.toObject() : p;
                // Candidate: look up CandidateProfile.profileImageId -> protected /files/:id
                if (part.role === 'candidate') {
                    try {
                        const cp = await CandidateProfile.findOne({ user: part._id }).select('profileImageId').lean();
                        if (cp && cp.profileImageId) {
                            part.profileImageUrl = `/files/${cp.profileImageId}`; // protected
                        }
                    } catch (e) { /* ignore */ }
                }
                // Company/HR: use user's company to get Company.logoFileId -> public /public-files/:id
                if ((part.role === 'company' || part.role === 'hr') && part.company) {
                    try {
                        const comp = await Company.findById(part.company).select('logoFileId').lean();
                        if (comp && comp.logoFileId) part.companyLogoUrl = `/public-files/${comp.logoFileId}`;
                    } catch (e) { /* ignore */ }
                }
                return part;
            }));
            const co = c.toObject();
            co.participants = parts;
            // If this chat references a Reference document, try to attach the author's profile image URL
            if (co.reference && co.reference.author) {
                try {
                    const refAuthor = co.reference.author;
                    // If author is populated with name/_id, attempt to find CandidateProfile
                    const CandidateProfile = mongoose.model('CandidateProfile');
                    const cp = await CandidateProfile.findOne({ user: refAuthor._id || refAuthor }).select('profileImageId').lean();
                    if (cp && cp.profileImageId) {
                        // attach a profileImageUrl to the nested author object
                        if (refAuthor._id) refAuthor.profileImageUrl = `/files/${cp.profileImageId}`;
                        else co.reference.authorProfileImageUrl = `/files/${cp.profileImageId}`;
                    }
                } catch (e) { /* ignore */ }
            }
            return co;
        }));

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chats', error: error.message });
    }
}

// 3. Get messages for a specific chat (FIXED: Sender Population)
async function getMessages(req, res) {
    const Chat = mongoose.model('Chat');
    const chatId = req.params.chatId;
    const userId = getUserId(req);

    try {
        const chat = await Chat.findById(chatId)
            .select('messages participants')
            .populate({ // FIX: Populate the sender within the messages array
                path: 'messages.sender',
                select: 'name role email' // Fetch name and role for display
            }); 

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Authorization check: Ensure user is a participant
        if (!chat.participants.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(chat.messages);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
}

// 4. Send a message to a chat
async function sendMessage(req, res) {
    const Chat = mongoose.model('Chat');
    const chatId = req.params.chatId;
    const userId = getUserId(req);
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
    const chat = await Chat.findById(chatId).select('participants');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Authorization check: Ensure user is a participant
        if (!chat.participants.map(id => id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Use the Chat model schema field names (text, createdAt)
        const message = {
            sender: new mongoose.Types.ObjectId(userId),
            text: content,
            createdAt: new Date()
        };

        // Push new message and return the created subdocument
        const updated = await Chat.findByIdAndUpdate(
            chatId,
            { 
                $push: { messages: message },
                updatedAt: new Date()
            },
            { new: true }
        ).select('messages');

        // The newly inserted message will be the last element
        const createdMessage = updated.messages[updated.messages.length - 1];
        res.status(201).json(createdMessage);

    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
}


module.exports = { createChat, getChats, getMessages, sendMessage };