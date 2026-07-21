const mongoose = require('mongoose');

async function getNotifications(req, res) {
    try {
        const Notification = mongoose.model('Notification');
        const limit = parseInt(req.query.limit) || 20;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
}

async function getUnreadCount(req, res) {
    try {
        const Notification = mongoose.model('Notification');
        const count = await Notification.countDocuments({ user: req.user._id, read: false });
        res.json({ count });
    } catch (err) {
        console.error("Error counting notifications:", err);
        res.status(500).json({ message: 'Error counting notifications' });
    }
}

async function markAsRead(req, res) {
    try {
        const Notification = mongoose.model('Notification');
        const { id } = req.params;

        // If id is 'all', mark all as read
        if (id === 'all') {
            await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
            return res.json({ message: 'All notifications marked as read' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ message: 'Error updating notification' });
    }
}

async function deleteNotification(req, res) {
    try {
        const Notification = mongoose.model('Notification');
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({ _id: id, user: req.user._id });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: 'Error deleting notification' });
    }
}

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    deleteNotification
};
