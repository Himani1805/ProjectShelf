const Notification = require('../models/notificationModel');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort('-createdAt')
            .populate('sender', 'name profileImage')
            .limit(50);

        // Return notifications array directly for frontend compatibility
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: `Notification not found with id of ${req.params.id}`
            });
        }

        // Check if user is the recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this notification'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: `Notification not found with id of ${req.params.id}`
            });
        }

        // Check if user is the recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this notification'
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a notification (utility function for internal use)
// @access  Private
exports.createNotification = async (recipientId, senderId, type, content, refType, refId, link) => {
    try {
        await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type,
            content,
            refType,
            refId,
            link
        });

        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

// @desc    Get recent notifications
// @route   GET /api/notifications/recent
// @access  Private
exports.getRecentNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id, read: false })
            .sort({ createdAt: -1 })
            .limit(5) // Limit to 5 recent unread notifications, adjust as needed
            .populate('sender', 'name profileImage');

        // Return notifications array directly for frontend compatibility
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};