/**
 * Pixel Commerce - Real-time Notification Service
 * Handles notifications across all platform dashboards
 */

class NotificationService {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.isInitialized = false;
        this.updateInterval = null;
        this.badge = null;
    }

    // Initialize the notification service
    init() {
        if (this.isInitialized) return;
        
        this.loadNotifications();
        this.setupBadge();
        this.startPolling();
        this.isInitialized = true;
        
        console.log('Notification Service initialized');
    }

    // Load notifications from localStorage or generate sample data
    loadNotifications() {
        const stored = localStorage.getItem('emsNotifications');
        if (stored) {
            this.notifications = JSON.parse(stored);
        } else {
            this.notifications = this.generateSampleNotifications();
            this.saveNotifications();
        }
    }

    // Save notifications to localStorage
    saveNotifications() {
        localStorage.setItem('emsNotifications', JSON.stringify(this.notifications));
    }

    // Setup notification badge in header
    setupBadge() {
        this.badge = document.getElementById('notificationBadge') || 
                     document.querySelector('.notification-badge');
        this.updateBadge();
    }

    // Update badge count
    updateBadge() {
        if (!this.badge) return;
        
        const unreadCount = this.getUnreadCount();
        this.badge.textContent = unreadCount;
        this.badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Get unread notification count
    getUnreadCount() {
        return this.notifications.filter(n => n.unread).length;
    }

    // Add new notification
    addNotification(notification) {
        const newNotif = {
            id: Date.now(),
            timestamp: Date.now(),
            unread: true,
            priority: 'normal',
            ...notification
        };

        this.notifications.unshift(newNotif);
        this.saveNotifications();
        this.updateBadge();
        this.notifyListeners('add', newNotif);
        
        // Show browser notification if permitted
        this.showBrowserNotification(newNotif);
        
        return newNotif;
    }

    // Mark notification as read
    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif && notif.unread) {
            notif.unread = false;
            this.saveNotifications();
            this.updateBadge();
            this.notifyListeners('read', notif);
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.notifications.forEach(n => n.unread = false);
        this.saveNotifications();
        this.updateBadge();
        this.notifyListeners('readAll');
    }

    // Delete notification
    deleteNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            const deleted = this.notifications.splice(index, 1)[0];
            this.saveNotifications();
            this.updateBadge();
            this.notifyListeners('delete', deleted);
        }
    }

    // Clear all notifications
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.updateBadge();
        this.notifyListeners('clearAll');
    }

    // Get all notifications
    getAll() {
        return [...this.notifications];
    }

    // Get notifications by filter
    getFiltered(filter = {}) {
        let filtered = [...this.notifications];

        if (filter.type) {
            filtered = filtered.filter(n => n.type === filter.type);
        }

        if (filter.platform) {
            filtered = filtered.filter(n => n.platform === filter.platform);
        }

        if (filter.unread !== undefined) {
            filtered = filtered.filter(n => n.unread === filter.unread);
        }

        if (filter.priority) {
            filtered = filtered.filter(n => n.priority === filter.priority);
        }

        return filtered;
    }

    // Subscribe to notification updates
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Notification listener error:', error);
            }
        });
    }

    // Start polling for new notifications
    startPolling(interval = 60000) { // Poll every 60 seconds
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.checkForUpdates();
        }, interval);
    }

    // Stop polling
    stopPolling() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Simulate checking for new notifications
    checkForUpdates() {
        // In production, this would make an API call
        // For now, randomly generate notifications (10% chance)
        if (Math.random() < 0.1) {
            const newNotif = this.generateRandomNotification();
            this.addNotification(newNotif);
        }
    }

    // Show browser notification
    async showBrowserNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `ems-${notification.id}`,
                requireInteraction: notification.priority === 'critical'
            });
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showBrowserNotification(notification);
            }
        }
    }

    // Request browser notification permission
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Generate random notification for simulation
    generateRandomNotification() {
        const types = ['order', 'stock', 'price', 'sync', 'alert'];
        const platforms = ['amazon', 'flipkart', 'meesho'];
        const priorities = ['normal', 'high', 'critical'];

        const templates = {
            order: {
                titles: ['New Order Received', 'Order Shipped', 'Order Delivered', 'Return Request', 'Order Cancelled'],
                messages: [
                    'A new order has been placed on {platform}',
                    'Your order has been shipped successfully',
                    'Order delivered to customer',
                    'Customer initiated a return request',
                    'Order has been cancelled by customer'
                ]
            },
            stock: {
                titles: ['Low Stock Alert', 'Stock Replenished', 'Critical Stock Alert', 'Inventory Updated'],
                messages: [
                    'Product inventory is running low on {platform}',
                    'Stock has been replenished for multiple products',
                    'Critical: Product out of stock on {platform}',
                    'Inventory levels updated successfully'
                ]
            },
            price: {
                titles: ['Competitor Price Drop', 'Price Update Applied', 'Price Alert', 'Dynamic Pricing Triggered'],
                messages: [
                    'Competitor reduced price on {platform}',
                    'Your price updates have been applied',
                    'Price alert: Your product is overpriced',
                    'Dynamic pricing adjusted based on demand'
                ]
            },
            sync: {
                titles: ['Platform Sync Complete', 'Sync Started', 'Sync Failed', 'Data Synchronized'],
                messages: [
                    'Platform synchronization completed for {platform}',
                    'Data sync initiated for {platform}',
                    'Sync failed for {platform} - please retry',
                    'All data synchronized successfully'
                ]
            },
            alert: {
                titles: ['System Alert', 'Action Required', 'Important Notice', 'Platform Update'],
                messages: [
                    'Important system notification for {platform}',
                    'Action required on your {platform} account',
                    'Important notice regarding platform policies',
                    'Platform update available for {platform}'
                ]
            }
        };

        const type = types[Math.floor(Math.random() * types.length)];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const template = templates[type];

        const title = template.titles[Math.floor(Math.random() * template.titles.length)];
        const message = template.messages[Math.floor(Math.random() * template.messages.length)]
            .replace('{platform}', platform.charAt(0).toUpperCase() + platform.slice(1));

        return {
            type,
            platform,
            priority,
            title,
            message,
            action: 'View Details',
            actionLink: `platforms/${platform}.html`
        };
    }

    // Generate sample notifications
    generateSampleNotifications() {
        return [
            {
                id: Date.now() - 1,
                type: 'order',
                platform: 'amazon',
                title: 'New Order Received',
                message: 'Order #AMZ-2025-8945 for Wireless Earbuds (₹1,299) has been placed.',
                timestamp: Date.now() - 2 * 60 * 1000,
                unread: true,
                priority: 'high',
                action: 'View Order',
                actionLink: 'orders/amazon-orders.html'
            },
            {
                id: Date.now() - 2,
                type: 'stock',
                platform: 'flipkart',
                title: 'Low Stock Alert',
                message: 'Smart Watch inventory is running low (3 units remaining). Consider reordering.',
                timestamp: Date.now() - 15 * 60 * 1000,
                unread: true,
                priority: 'critical',
                action: 'Reorder',
                actionLink: 'inventory/flipkart-stock.html'
            },
            {
                id: Date.now() - 3,
                type: 'sync',
                platform: 'meesho',
                title: 'Platform Sync Complete',
                message: 'Successfully synchronized 308 products with Meesho.',
                timestamp: Date.now() - 30 * 60 * 1000,
                unread: true,
                priority: 'normal',
                action: 'View Report',
                actionLink: 'platforms/meesho.html'
            }
        ];
    }

    // Format timestamp to relative time
    static formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return new Date(timestamp).toLocaleDateString();
    }
}

// Create global instance
window.notificationService = new NotificationService();

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notificationService.init();
    });
} else {
    window.notificationService.init();
}
