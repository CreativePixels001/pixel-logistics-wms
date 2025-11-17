/**
 * Push Notification Manager
 * Handles push notification subscription and delivery
 */

class PushNotificationManager {
  constructor() {
    this.swRegistration = null;
    this.subscription = null;
    this.isSubscribed = false;
    this.vapidPublicKey = null; // Will be set from server
    
    this.notificationTypes = {
      TASK_ASSIGNED: 'task_assigned',
      LOW_STOCK: 'low_stock',
      ORDER_UPDATE: 'order_update',
      CYCLE_COUNT_DUE: 'cycle_count_due',
      SHIPMENT_READY: 'shipment_ready',
      RECEIVING_ALERT: 'receiving_alert',
      SYSTEM_ALERT: 'system_alert'
    };

    this.init();
  }

  /**
   * Initialize push notifications
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('[Push] Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.log('[Push] Push notifications not supported');
      return false;
    }

    // Wait for service worker to be ready
    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker ready');
      
      // Check existing subscription
      await this.checkSubscription();
      
      return true;
    } catch (error) {
      console.error('[Push] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check existing subscription
   */
  async checkSubscription() {
    try {
      this.subscription = await this.swRegistration.pushManager.getSubscription();
      this.isSubscribed = this.subscription !== null;
      
      if (this.isSubscribed) {
        console.log('[Push] Already subscribed');
      }
      
      return this.isSubscribed;
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('[Push] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('[Push] Notification permission denied');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('[Push] Notification permission granted');
      return true;
    } else {
      console.log('[Push] Notification permission denied');
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe() {
    if (!this.swRegistration) {
      console.error('[Push] Service Worker not registered');
      return null;
    }

    try {
      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      // Subscribe to push
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidKey()
      });

      this.subscription = subscription;
      this.isSubscribed = true;

      console.log('[Push] Subscribed:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    if (!this.subscription) {
      console.log('[Push] No active subscription');
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove from server
      await this.removeSubscriptionFromServer(this.subscription);
      
      this.subscription = null;
      this.isSubscribed = false;
      
      console.log('[Push] Unsubscribed');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Get VAPID public key
   */
  getVapidKey() {
    // In production, this should come from your server
    // For now, using a placeholder
    const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp9_p_-oBAMO--2wiBhOmkJ1_9sS8TzJGSJxNnXWKOgH6jHSiFBpbY4';
    
    return this.urlBase64ToUint8Array(publicKey);
  }

  /**
   * Convert VAPID key from base64
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  /**
   * Send subscription to server
   */
  async sendSubscriptionToServer(subscription) {
    console.log('[Push] Sending subscription to server:', subscription);
    
    // In production, send to your backend API
    // For now, store in localStorage as demo
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          auth: this.arrayBufferToBase64(subscription.getKey('auth')),
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh'))
        },
        userId: this.getCurrentUserId(),
        timestamp: Date.now()
      };

      localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
      console.log('[Push] Subscription saved');
      
      return true;
    } catch (error) {
      console.error('[Push] Failed to save subscription:', error);
      return false;
    }
  }

  /**
   * Remove subscription from server
   */
  async removeSubscriptionFromServer(subscription) {
    console.log('[Push] Removing subscription from server');
    
    // In production, call your backend API
    localStorage.removeItem('push_subscription');
    
    return true;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Show local notification
   */
  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.log('[Push] Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('[Push] No notification permission');
      return;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        timestamp: Date.now()
      }
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.swRegistration) {
      // Show via service worker (works even when app is closed)
      this.swRegistration.showNotification(title, notificationOptions);
    } else {
      // Fallback to regular notification
      new Notification(title, notificationOptions);
    }
  }

  /**
   * Notification templates
   */
  notifications = {
    taskAssigned: (taskName, assignee) => ({
      title: 'New Task Assigned',
      body: `${taskName} has been assigned to ${assignee}`,
      icon: '/icons/icon-192x192.png',
      tag: 'task-assigned',
      data: { type: this.notificationTypes.TASK_ASSIGNED, taskName }
    }),

    lowStock: (itemNumber, quantity, location) => ({
      title: 'Low Stock Alert',
      body: `${itemNumber} is low (${quantity} units) at ${location}`,
      icon: '/icons/icon-192x192.png',
      tag: 'low-stock',
      requireInteraction: true,
      data: { type: this.notificationTypes.LOW_STOCK, itemNumber }
    }),

    orderUpdate: (orderNumber, status) => ({
      title: 'Order Status Update',
      body: `Order ${orderNumber} is now ${status}`,
      icon: '/icons/icon-192x192.png',
      tag: `order-${orderNumber}`,
      data: { type: this.notificationTypes.ORDER_UPDATE, orderNumber }
    }),

    cycleCountDue: (location, itemCount) => ({
      title: 'Cycle Count Due',
      body: `${itemCount} items need counting at ${location}`,
      icon: '/icons/icon-192x192.png',
      tag: 'cycle-count-due',
      actions: [
        { action: 'start', title: 'Start Count' },
        { action: 'snooze', title: 'Remind Later' }
      ],
      data: { type: this.notificationTypes.CYCLE_COUNT_DUE, location }
    }),

    shipmentReady: (orderNumber, carrier) => ({
      title: 'Shipment Ready',
      body: `Order ${orderNumber} ready for ${carrier} pickup`,
      icon: '/icons/icon-192x192.png',
      tag: 'shipment-ready',
      data: { type: this.notificationTypes.SHIPMENT_READY, orderNumber }
    }),

    receivingAlert: (poNumber, supplierName) => ({
      title: 'Receiving Alert',
      body: `PO ${poNumber} from ${supplierName} is ready to receive`,
      icon: '/icons/icon-192x192.png',
      tag: 'receiving-alert',
      actions: [
        { action: 'receive', title: 'Start Receiving' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { type: this.notificationTypes.RECEIVING_ALERT, poNumber }
    }),

    systemAlert: (message, severity = 'info') => ({
      title: 'System Alert',
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'system-alert',
      requireInteraction: severity === 'critical',
      data: { type: this.notificationTypes.SYSTEM_ALERT, severity }
    })
  };

  /**
   * Send specific notification
   */
  sendTaskAssigned(taskName, assignee) {
    this.showNotification('New Task Assigned', this.notifications.taskAssigned(taskName, assignee));
  }

  sendLowStockAlert(itemNumber, quantity, location) {
    this.showNotification('Low Stock Alert', this.notifications.lowStock(itemNumber, quantity, location));
  }

  sendOrderUpdate(orderNumber, status) {
    this.showNotification('Order Status Update', this.notifications.orderUpdate(orderNumber, status));
  }

  sendCycleCountDue(location, itemCount) {
    this.showNotification('Cycle Count Due', this.notifications.cycleCountDue(location, itemCount));
  }

  sendShipmentReady(orderNumber, carrier) {
    this.showNotification('Shipment Ready', this.notifications.shipmentReady(orderNumber, carrier));
  }

  sendReceivingAlert(poNumber, supplierName) {
    this.showNotification('Receiving Alert', this.notifications.receivingAlert(poNumber, supplierName));
  }

  sendSystemAlert(message, severity = 'info') {
    this.showNotification('System Alert', this.notifications.systemAlert(message, severity));
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    return localStorage.getItem('currentUserId') || 'demo-user';
  }

  /**
   * Get subscription status
   */
  getStatus() {
    return {
      isSubscribed: this.isSubscribed,
      hasPermission: Notification.permission === 'granted',
      isSupported: 'PushManager' in window,
      subscription: this.subscription
    };
  }

  /**
   * Test notification
   */
  testNotification() {
    this.showNotification('Test Notification', {
      body: 'This is a test notification from DLT WMS',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test-notification',
      vibrate: [200, 100, 200, 100, 200]
    });
  }
}

// Initialize global instance
const pushNotifications = new PushNotificationManager();

// Expose to window
window.pushNotifications = pushNotifications;

console.log('[Push] Push Notification Manager initialized');
