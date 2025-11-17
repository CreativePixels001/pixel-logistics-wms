/**
 * Create Order Wizard
 * Handles order creation with multi-step form
 */

// Sample item data (in real app, this would come from backend)
const sampleItems = [
  { id: 'ITEM-001', name: 'Laptop Computer', uom: 'EA' },
  { id: 'ITEM-002', name: 'Wireless Mouse', uom: 'EA' },
  { id: 'ITEM-003', name: 'USB Cable', uom: 'EA' },
  { id: 'ITEM-004', name: 'Monitor 27"', uom: 'EA' },
  { id: 'ITEM-005', name: 'Keyboard', uom: 'EA' },
  { id: 'ITEM-006', name: 'Webcam HD', uom: 'EA' },
  { id: 'ITEM-007', name: 'Headset', uom: 'EA' },
  { id: 'ITEM-008', name: 'Desk Lamp', uom: 'EA' },
  { id: 'ITEM-009', name: 'Office Chair', uom: 'EA' },
  { id: 'ITEM-010', name: 'Desk Organizer', uom: 'EA' }
];

let orderLineCounter = 0;

// Initialize wizard
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDate').value = today;
  
  // Set requested ship date to 3 days from now
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  document.getElementById('requestedShipDate').value = threeDaysLater.toISOString().split('T')[0];

  // Auto-generate order number
  const orderNumber = `ORD-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  document.getElementById('orderNumber').value = orderNumber;

  // Initialize wizard
  const wizard = new FormWizard({
    formId: 'orderWizardForm',
    steps: [
      { id: 'step1', name: 'Order Details' },
      { id: 'step2', name: 'Order Lines' },
      { id: 'step3', name: 'Shipping Info' },
      { id: 'step4', name: 'Review & Submit' }
    ],
    autoSaveKey: 'order_creation_draft',
    onStepChange: (stepIndex) => {
      if (stepIndex === 3) {
        // Entering review step - populate review data
        populateReviewData();
      }
    },
    onComplete: (formData) => {
      submitOrder(formData);
    }
  });

  // Add order line button
  document.getElementById('addOrderLine').addEventListener('click', addOrderLine);

  // Add first order line by default
  addOrderLine();
});

function addOrderLine() {
  orderLineCounter++;
  
  const container = document.getElementById('orderLinesContainer');
  
  const lineItem = document.createElement('div');
  lineItem.className = 'order-line-item';
  lineItem.dataset.lineNumber = orderLineCounter;
  
  lineItem.innerHTML = `
    <div class="order-line-header">
      <span class="line-number">Line ${orderLineCounter}</span>
      <button type="button" class="remove-line" onclick="removeOrderLine(${orderLineCounter})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Remove
      </button>
    </div>
    <div class="order-line-fields">
      <div class="form-group">
        <label>Item <span class="required">*</span></label>
        <select class="form-control item-select" name="orderLines[${orderLineCounter}][item]" required onchange="updateOrderSummary()">
          <option value="">Select Item</option>
          ${sampleItems.map(item => `<option value="${item.id}">${item.id} - ${item.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Quantity <span class="required">*</span></label>
        <input type="number" class="form-control quantity-input" name="orderLines[${orderLineCounter}][quantity]" min="1" value="1" required onchange="updateOrderSummary()">
      </div>
      <div class="form-group">
        <label>UOM <span class="required">*</span></label>
        <select class="form-control" name="orderLines[${orderLineCounter}][uom]" required>
          <option value="EA">Each (EA)</option>
          <option value="CS">Case (CS)</option>
          <option value="PL">Pallet (PL)</option>
          <option value="BX">Box (BX)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Unit Price</label>
        <input type="number" class="form-control" name="orderLines[${orderLineCounter}][unitPrice]" min="0" step="0.01" placeholder="0.00">
      </div>
    </div>
  `;
  
  container.appendChild(lineItem);
  updateOrderSummary();
}

function removeOrderLine(lineNumber) {
  const lineItem = document.querySelector(`[data-line-number="${lineNumber}"]`);
  if (lineItem) {
    lineItem.remove();
    updateOrderSummary();
    
    // Renumber remaining lines
    const remainingLines = document.querySelectorAll('.order-line-item');
    remainingLines.forEach((line, index) => {
      const lineNumSpan = line.querySelector('.line-number');
      if (lineNumSpan) {
        lineNumSpan.textContent = `Line ${index + 1}`;
      }
    });
  }
}

function updateOrderSummary() {
  const orderLines = document.querySelectorAll('.order-line-item');
  const totalLines = orderLines.length;
  
  let totalUnits = 0;
  orderLines.forEach(line => {
    const quantityInput = line.querySelector('.quantity-input');
    if (quantityInput && quantityInput.value) {
      totalUnits += parseInt(quantityInput.value) || 0;
    }
  });
  
  document.getElementById('totalLines').textContent = totalLines;
  document.getElementById('totalUnits').textContent = totalUnits;
}

function populateReviewData() {
  // Get form data
  const formData = new FormData(document.getElementById('orderWizardForm'));
  
  // Order Details
  const orderDetailsHTML = `
    <div class="review-item">
      <div class="review-label">Order Number</div>
      <div class="review-value">${formData.get('orderNumber') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Order Date</div>
      <div class="review-value">${formatDate(formData.get('orderDate'))}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Customer Name</div>
      <div class="review-value">${formData.get('customerName') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Customer ID</div>
      <div class="review-value">${formData.get('customerId') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Email</div>
      <div class="review-value">${formData.get('customerEmail') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Phone</div>
      <div class="review-value">${formData.get('customerPhone') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Requested Ship Date</div>
      <div class="review-value">${formatDate(formData.get('requestedShipDate'))}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Priority</div>
      <div class="review-value">${capitalizeFirst(formData.get('priority'))}</div>
    </div>
  `;
  document.getElementById('reviewOrderDetails').innerHTML = orderDetailsHTML;
  
  // Shipping Address
  const shippingAddressHTML = `
    <div class="review-item" style="grid-column: 1 / -1;">
      <div class="review-label">Street Address</div>
      <div class="review-value">${formData.get('shipToAddress') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">City</div>
      <div class="review-value">${formData.get('shipToCity') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">State/Province</div>
      <div class="review-value">${formData.get('shipToState') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">ZIP/Postal Code</div>
      <div class="review-value">${formData.get('shipToZip') || 'N/A'}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Country</div>
      <div class="review-value">${getCountryName(formData.get('shipToCountry'))}</div>
    </div>
  `;
  document.getElementById('reviewShippingAddress').innerHTML = shippingAddressHTML;
  
  // Order Lines
  const orderLines = [];
  const orderLineItems = document.querySelectorAll('.order-line-item');
  
  orderLineItems.forEach((line, index) => {
    const itemSelect = line.querySelector('.item-select');
    const quantityInput = line.querySelector('.quantity-input');
    const uomSelect = line.querySelector('select[name*="[uom]"]');
    const priceInput = line.querySelector('input[name*="[unitPrice]"]');
    
    if (itemSelect.value) {
      const selectedItem = sampleItems.find(item => item.id === itemSelect.value);
      orderLines.push({
        line: index + 1,
        item: itemSelect.options[itemSelect.selectedIndex].text,
        quantity: quantityInput.value,
        uom: uomSelect.value,
        unitPrice: priceInput.value || '0.00'
      });
    }
  });
  
  let orderLinesHTML = `
    <table>
      <thead>
        <tr>
          <th>Line</th>
          <th>Item</th>
          <th>Quantity</th>
          <th>UOM</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let grandTotal = 0;
  orderLines.forEach(line => {
    const lineTotal = parseFloat(line.quantity) * parseFloat(line.unitPrice);
    grandTotal += lineTotal;
    
    orderLinesHTML += `
      <tr>
        <td>${line.line}</td>
        <td>${line.item}</td>
        <td>${line.quantity}</td>
        <td>${line.uom}</td>
        <td>$${parseFloat(line.unitPrice).toFixed(2)}</td>
        <td>$${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  });
  
  orderLinesHTML += `
        <tr style="font-weight: 600; background: var(--grey-lightest);">
          <td colspan="5" style="text-align: right;">Grand Total:</td>
          <td>$${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
  
  document.getElementById('reviewOrderLines').innerHTML = orderLinesHTML;
  
  // Shipping Information
  const shippingOptions = [];
  if (formData.get('signatureRequired')) shippingOptions.push('Signature Required');
  if (formData.get('saturdayDelivery')) shippingOptions.push('Saturday Delivery');
  if (formData.get('residentialDelivery')) shippingOptions.push('Residential Delivery');
  if (formData.get('insured')) shippingOptions.push('Insurance');
  
  const shippingInfoHTML = `
    <div class="review-item">
      <div class="review-label">Carrier</div>
      <div class="review-value">${capitalizeFirst(formData.get('carrier'))}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Service Level</div>
      <div class="review-value">${capitalizeFirst(formData.get('serviceLevel'))}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Freight Terms</div>
      <div class="review-value">${capitalizeFirst(formData.get('freightTerms'))}</div>
    </div>
    <div class="review-item">
      <div class="review-label">Shipping Cost</div>
      <div class="review-value">$${parseFloat(formData.get('shippingCost') || 0).toFixed(2)}</div>
    </div>
    <div class="review-item" style="grid-column: 1 / -1;">
      <div class="review-label">Shipping Options</div>
      <div class="review-value">${shippingOptions.length > 0 ? shippingOptions.join(', ') : 'None'}</div>
    </div>
  `;
  document.getElementById('reviewShippingInfo').innerHTML = shippingInfoHTML;
}

function submitOrder(formData) {
  // Show loading notification
  const notification = document.createElement('div');
  notification.className = 'notification notification-info';
  notification.innerHTML = '<span>Submitting order...</span>';
  document.querySelector('.notification-container').appendChild(notification);
  
  // Simulate API call
  setTimeout(() => {
    notification.remove();
    
    // Show success notification
    const successNotification = document.createElement('div');
    successNotification.className = 'notification notification-success';
    successNotification.innerHTML = `
      <span>Order ${formData.orderNumber} created successfully!</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.querySelector('.notification-container').appendChild(successNotification);
    
    // Redirect to orders page after 2 seconds
    setTimeout(() => {
      window.location.href = 'orders.html';
    }, 2000);
  }, 1500);
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalizeFirst(str) {
  if (!str) return 'N/A';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCountryName(code) {
  const countries = {
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico',
    'UK': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IN': 'India',
    'CN': 'China'
  };
  return countries[code] || code;
}
