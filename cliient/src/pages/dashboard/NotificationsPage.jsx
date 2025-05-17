import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationsPage = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(notification => !notification.read)
            : notifications.filter(notification => notification.read);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <button
                    onClick={handleMarkAllAsRead}
                    className="btn btn-sm btn-ghost"
                    disabled={unreadCount === 0}
                >
                    Mark all as read
                </button>
            </div>

            <div className="tabs tabs-boxed mb-6">
                <button
                    className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`tab ${filter === 'unread' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`tab ${filter === 'read' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read
                </button>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                    <p className="text-base-content/70">
                        {filter === 'all'
                            ? 'You don\'t have any notifications yet'
                            : filter === 'unread'
                                ? 'You don\'t have any unread notifications'
                                : 'You don\'t have any read notifications'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-primary' : ''}`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <div className="card-body p-4">
                                <div className="flex items-start gap-4">
                                    <div className="avatar">
                                        <div className="w-10 rounded-full">
                                            <img
                                                src={notification.sender?.avatar || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
                                                alt="avatar"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium">{notification.title}</h3>
                                            <span className="text-xs opacity-70">{new Date(notification.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm mt-1">{notification.message}</p>
                                        {notification.actionUrl && (
                                            <div className="card-actions justify-end mt-2">
                                                <a href={notification.actionUrl} className="btn btn-sm btn-primary">
                                                    {notification.actionText || 'View'}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;