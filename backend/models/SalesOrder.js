const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  soNumber: {
    type: String,
    unique: true,
    // Auto-generated: SO-2025-000001
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    index: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 18
    },
    discount: {
      type: Number,
      default: 0
    },
    amount: Number,
    taxAmount: Number,
    totalAmount: Number,
    allocatedQuantity: {
      type: Number,
      default: 0
    },
    pickedQuantity: {
      type: Number,
      default: 0
    },
    packedQuantity: {
      type: Number,
      default: 0
    },
    shippedQuantity: {
      type: Number,
      default: 0
    },
    deliveredQuantity: {
      type: Number,
      default: 0
    },
    returnedQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'allocated', 'picked', 'packed', 'shipped', 'delivered', 'returned'],
      default: 'pending'
    }
  }],
  pricing: {
    subtotal: Number,
    discount: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'fixed'
    },
    taxAmount: Number,
    shippingCharges: {
      type: Number,
      default: 0
    },
    packingCharges: {
      type: Number,
      default: 0
    },
    otherCharges: {
      type: Number,
      default: 0
    },
    totalAmount: Number,
    paidAmount: {
      type: Number,
      default: 0
    },
    balanceAmount: Number
  },
  dates: {
    orderDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    expectedDeliveryDate: {
      type: Date,
      required: true
    },
    confirmedDate: Date,
    allocatedDate: Date,
    pickedDate: Date,
    packedDate: Date,
    shippedDate: Date,
    deliveredDate: Date,
    cancelDate: Date
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    fullAddress: String,
    contactPerson: String,
    contactPhone: String
  },
  paymentInfo: {
    paymentMode: {
      type: String,
      enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'cod', 'credit-card', 'credit'],
      default: 'bank-transfer'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid'
    },
    creditDays: Number,
    dueDate: Date,
    transactionId: String,
    paymentNotes: String
  },
  fulfillment: {
    pickingTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickingTask'
    },
    packingTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackingTask'
    },
    shippingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipping'
    },
    trackingNumber: String,
    carrierName: String,
    shippingMethod: String,
    estimatedDeliveryDays: Number
  },
  status: {
    type: String,
    enum: [
      'draft', 
      'confirmed', 
      'allocated', 
      'picking', 
      'picked',
      'packing',
      'packed', 
      'shipped', 
      'in-transit',
      'delivered', 
      'cancelled', 
      'returned',
      'partially-returned',
      'closed'
    ],
    default: 'draft',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  returns: [{
    returnDate: Date,
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      reason: String,
      condition: {
        type: String,
        enum: ['damaged', 'defective', 'wrong-item', 'not-needed', 'other']
      },
      action: {
        type: String,
        enum: ['refund', 'exchange', 'credit-note']
      },
      refundAmount: Number
    }],
    totalRefund: Number,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    }
  }],
  invoiceNumber: String,
  invoiceDate: Date,
  notes: String,
  internalNotes: String,
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
salesOrderSchema.index({ soNumber: 1 });
salesOrderSchema.index({ customer: 1 });
salesOrderSchema.index({ warehouse: 1 });
salesOrderSchema.index({ status: 1 });
salesOrderSchema.index({ 'dates.orderDate': -1 });
salesOrderSchema.index({ 'dates.expectedDeliveryDate': 1 });
salesOrderSchema.index({ invoiceNumber: 1 });

// Auto-generate SO number
salesOrderSchema.pre('save', async function(next) {
  if (!this.soNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      soNumber: new RegExp(`^SO-${year}-`)
    });
    this.soNumber = `SO-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate item amounts
  let subtotal = 0;
  let totalTax = 0;
  
  this.items.forEach(item => {
    const baseAmount = item.quantity * item.unitPrice;
    item.amount = baseAmount - (item.discount || 0);
    item.taxAmount = (item.amount * item.taxRate) / 100;
    item.totalAmount = item.amount + item.taxAmount;
    
    // Update item status based on fulfillment
    if (item.deliveredQuantity >= item.quantity) {
      item.status = 'delivered';
    } else if (item.shippedQuantity > 0) {
      item.status = 'shipped';
    } else if (item.packedQuantity > 0) {
      item.status = 'packed';
    } else if (item.pickedQuantity > 0) {
      item.status = 'picked';
    } else if (item.allocatedQuantity > 0) {
      item.status = 'allocated';
    } else {
      item.status = 'pending';
    }
    
    subtotal += item.amount;
    totalTax += item.taxAmount;
  });
  
  // Calculate pricing
  let discountAmount = this.pricing.discount || 0;
  if (this.pricing.discountType === 'percentage') {
    discountAmount = (subtotal * discountAmount) / 100;
  }
  
  this.pricing.subtotal = subtotal;
  this.pricing.taxAmount = totalTax;
  this.pricing.totalAmount = 
    subtotal + 
    totalTax + 
    (this.pricing.shippingCharges || 0) + 
    (this.pricing.packingCharges || 0) +
    (this.pricing.otherCharges || 0) - 
    discountAmount;
  this.pricing.balanceAmount = this.pricing.totalAmount - (this.pricing.paidAmount || 0);
  
  // Update payment status
  if (this.pricing.paidAmount === 0) {
    this.paymentInfo.paymentStatus = 'unpaid';
  } else if (this.pricing.paidAmount < this.pricing.totalAmount) {
    this.paymentInfo.paymentStatus = 'partial';
  } else {
    this.paymentInfo.paymentStatus = 'paid';
  }
  
  // Calculate due date
  if (this.paymentInfo.creditDays && this.dates.orderDate) {
    const dueDate = new Date(this.dates.orderDate);
    dueDate.setDate(dueDate.getDate() + this.paymentInfo.creditDays);
    this.paymentInfo.dueDate = dueDate;
  }
  
  // Generate invoice number if shipped
  if (this.status === 'shipped' && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}-`)
    });
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    this.invoiceDate = new Date();
  }
  
  next();
});

// Virtual for total items
salesOrderSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total quantity
salesOrderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for fulfillment percentage
salesOrderSchema.virtual('fulfillmentPercentage').get(function() {
  const totalQty = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveredQty = this.items.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0);
  return totalQty > 0 ? Math.round((deliveredQty / totalQty) * 100) : 0;
});

// Method to check if overdue
salesOrderSchema.methods.isOverdue = function() {
  if (['delivered', 'cancelled', 'closed'].includes(this.status)) {
    return false;
  }
  return new Date() > new Date(this.dates.expectedDeliveryDate);
};

// Static method to get pending SOs
salesOrderSchema.statics.getPending = async function() {
  return this.find({
    status: { $in: ['confirmed', 'allocated', 'picking', 'picked', 'packing', 'packed'] }
  })
  .populate('customer', 'name code contact')
  .populate('warehouse', 'name code')
  .populate('createdBy', 'name email')
  .sort({ 'dates.expectedDeliveryDate': 1 });
};

// Static method to get overdue SOs
salesOrderSchema.statics.getOverdue = async function() {
  return this.find({
    status: { $in: ['confirmed', 'allocated', 'picking', 'picked', 'packing', 'packed', 'shipped', 'in-transit'] },
    'dates.expectedDeliveryDate': { $lt: new Date() }
  })
  .populate('customer', 'name code contact')
  .populate('warehouse', 'name code')
  .sort({ 'dates.expectedDeliveryDate': 1 });
};

// Static method to get SOs by customer
salesOrderSchema.statics.getByCustomer = async function(customerId) {
  return this.find({ customer: customerId })
    .populate('warehouse', 'name code')
    .populate('createdBy', 'name email')
    .sort({ 'dates.orderDate': -1 });
};

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
