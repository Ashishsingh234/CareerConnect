const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['application_update', 'new_message', 'job_alert', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
    link: { type: String }, // Optional link to navigate when clicked
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
