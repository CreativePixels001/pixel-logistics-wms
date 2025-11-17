/**
 * DLT WMS - Advanced Notification System
 * Provides toast notifications, alerts, and confirmation dialogs
 * with support for different types, positions, and actions
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000; // 5 seconds
    this.init();
  }

  init() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notificationContainer')) {
      this.container = document.createElement('div');
      this.container.id = 'notificationContainer';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notificationContainer');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The notification message
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (0 = no auto-dismiss)
   * @param {object} options - Additional options (action, icon, position)
   */
  toast(message, type = 'info', duration = this.defaultDuration, options = {}) {
    const notification = {
      id: this.generateId(),
      message,
      type,
      duration,
      timestamp: new Date(),
      ...options
    };

    // Limit number of notifications
    if (this.notifications.length >= this.maxNotifications) {
      this.dismiss(this.notifications[0].id);
    }

    this.notifications.push(notification);
    this.render(notification);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Convenience methods for different types
   */
  success(message, duration, options) {
    return this.toast(message, 'success', duration, options);
  }

  error(message, duration = 0, options) {
    return this.toast(message, 'error', duration, options);
  }

  warning(message, duration, options) {
    return this.toast(message, 'warning', duration, options);
  }

  info(message, duration, options) {
    return this.toast(message, 'info', duration, options);
  }

  /**
   * Show a confirmation dialog
   * @param {string} message - The confirmation message
   * @param {function} onConfirm - Callback when confirmed
   * @param {function} onCancel - Callback when cancelled
   * @param {object} options - Additional options
   */
  confirm(message, onConfirm, onCancel = null, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'notification-dialog';
    
    const title = options.title || 'Confirm Action';
    const confirmText = options.confirmText || 'Confirm';
    const cancelText = options.cancelText || 'Cancel';
    const isDangerous = options.danger || false;
    
    dialog.innerHTML = `
      <div class="notification-dialog-header">
        <h3>${title}</h3>
      </div>
      <div class="notification-dialog-body">
        <p>${message}</p>
      </div>
      <div class="notification-dialog-footer">
        <button class="btn btn-outline" id="notificationCancel">${cancelText}</button>
        <button class="btn ${isDangerous ? 'btn-danger' : 'btn-primary'}" id="notificationConfirm">${confirmText}</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Add animation
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
    
    const closeDialog = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    
    dialog.querySelector('#notificationConfirm').addEventListener('click', () => {
      closeDialog();
      if (onConfirm) onConfirm();
    });
    
    dialog.querySelector('#notificationCancel').addEventListener('click', () => {
      closeDialog();
      if (onCancel) onCancel();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
        if (onCancel) onCancel();
      }
    });
  }

  /**
   * Show a prompt dialog for user input
   * @param {string} message - The prompt message
   * @param {function} onSubmit - Callback with input value
   * @param {object} options - Additional options
   */
  prompt(message, onSubmit, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'notification-dialog';
    
    const title = options.title || 'Input Required';
    const placeholder = options.placeholder || '';
    const defaultValue = options.defaultValue || '';
    const submitText = options.submitText || 'Submit';
    
    dialog.innerHTML = `
      <div class="notification-dialog-header">
        <h3>${title}</h3>
      </div>
      <div class="notification-dialog-body">
        <p>${message}</p>
        <input type="text" class="form-input" id="notificationInput" 
               placeholder="${placeholder}" value="${defaultValue}" autofocus>
      </div>
      <div class="notification-dialog-footer">
        <button class="btn btn-outline" id="notificationCancel">Cancel</button>
        <button class="btn btn-primary" id="notificationSubmit">${submitText}</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.classList.add('show');
      dialog.querySelector('#notificationInput').focus();
    }, 10);
    
    const closeDialog = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    
    const submit = () => {
      const value = dialog.querySelector('#notificationInput').value.trim();
      if (value) {
        closeDialog();
        if (onSubmit) onSubmit(value);
      }
    };
    
    dialog.querySelector('#notificationSubmit').addEventListener('click', submit);
    dialog.querySelector('#notificationCancel').addEventListener('click', closeDialog);
    dialog.querySelector('#notificationInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog();
    });
  }

  /**
   * Show a loading indicator
   * @param {string} message - Loading message
   * @returns {function} Function to dismiss the loader
   */
  loading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay notification-loading';
    overlay.id = 'notificationLoader';
    
    overlay.innerHTML = `
      <div class="notification-loader">
        <div class="loader-spinner"></div>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    
    return () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      }, 300);
    };
  }

  /**
   * Render a notification
   */
  render(notification) {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification notification-${notification.type}`;
    notificationEl.id = `notification-${notification.id}`;
    notificationEl.setAttribute('data-id', notification.id);
    
    const icon = this.getIcon(notification.type, notification.icon);
    const hasAction = notification.action && notification.actionText;
    
    notificationEl.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-message">${notification.message}</div>
        ${hasAction ? `<button class="notification-action" data-id="${notification.id}">${notification.actionText}</button>` : ''}
      </div>
      <button class="notification-close" data-id="${notification.id}">&times;</button>
    `;
    
    this.container.appendChild(notificationEl);
    
    // Trigger animation
    setTimeout(() => {
      notificationEl.classList.add('show');
    }, 10);
    
    // Event listeners
    const closeBtn = notificationEl.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(notification.id);
    });
    
    if (hasAction) {
      const actionBtn = notificationEl.querySelector('.notification-action');
      actionBtn.addEventListener('click', () => {
        if (notification.action) notification.action();
        this.dismiss(notification.id);
      });
    }
  }

  /**
   * Dismiss a notification
   */
  dismiss(id) {
    const notificationEl = document.getElementById(`notification-${id}`);
    if (notificationEl) {
      notificationEl.classList.remove('show');
      notificationEl.classList.add('hide');
      
      setTimeout(() => {
        if (notificationEl.parentNode) {
          this.container.removeChild(notificationEl);
        }
      }, 300);
    }
    
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    this.notifications.forEach(n => this.dismiss(n.id));
  }

  /**
   * Get icon based on type
   */
  getIcon(type, customIcon) {
    if (customIcon) return customIcon;
    
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    
    return icons[type] || icons.info;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create global instance
window.notify = new NotificationSystem();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationSystem;
}
