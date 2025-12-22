const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true,
    // Auto-generated: PO-2025-000001
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required'],
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
      default: 18 // GST %
    },
    discount: {
      type: Number,
      default: 0
    },
    amount: Number, // Calculated: (quantity * unitPrice) - discount
    taxAmount: Number, // Calculated
    totalAmount: Number, // Calculated: amount + taxAmount
    receivedQuantity: {
      type: Number,
      default: 0
    },
    acceptedQuantity: {
      type: Number,
      default: 0
    },
    rejectedQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'received', 'cancelled'],
      default: 'pending'
    }
  }],
  pricing: {
    subtotal: Number,
    discount: {
      type: Number,
      default: 0
    },
    taxAmount: Number,
    shippingCharges: {
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
    actualDeliveryDate: Date,
    approvalDate: Date,
    cancelDate: Date
  },
  paymentTerms: {
    creditDays: Number,
    paymentMode: {
      type: String,
      enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'credit'],
      default: 'bank-transfer'
    },
    advancePercentage: {
      type: Number,
      default: 0
    },
    advanceAmount: Number,
    dueDate: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'sent', 'partial', 'received', 'cancelled', 'closed'],
    default: 'draft',
    index: true
  },
  approval: {
    required: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    approvalNotes: String,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionDate: Date,
    rejectionReason: String
  },
  shipping: {
    shippingMethod: String,
    trackingNumber: String,
    carrierName: String,
    shippingAddress: String
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['invoice', 'bill', 'quotation', 'delivery-note', 'other']
    },
    url: String,
    uploadedAt: Date
  }],
  notes: String,
  internalNotes: String,
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
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ warehouse: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ 'dates.orderDate': -1 });
purchaseOrderSchema.index({ 'dates.expectedDeliveryDate': 1 });

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      poNumber: new RegExp(`^PO-${year}-`)
    });
    this.poNumber = `PO-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate item amounts
  let subtotal = 0;
  let totalTax = 0;
  
  this.items.forEach(item => {
    // Calculate item amount
    const baseAmount = item.quantity * item.unitPrice;
    item.amount = baseAmount - (item.discount || 0);
    
    // Calculate tax
    item.taxAmount = (item.amount * item.taxRate) / 100;
    
    // Calculate total
    item.totalAmount = item.amount + item.taxAmount;
    
    // Update item status based on received quantity
    if (item.receivedQuantity === 0) {
      item.status = 'pending';
    } else if (item.receivedQuantity < item.quantity) {
      item.status = 'partial';
    } else {
      item.status = 'received';
    }
    
    subtotal += item.amount;
    totalTax += item.taxAmount;
  });
  
  // Calculate pricing
  this.pricing.subtotal = subtotal;
  this.pricing.taxAmount = totalTax;
  this.pricing.totalAmount = 
    subtotal + 
    totalTax + 
    (this.pricing.shippingCharges || 0) + 
    (this.pricing.otherCharges || 0) - 
    (this.pricing.discount || 0);
  this.pricing.balanceAmount = this.pricing.totalAmount - (this.pricing.paidAmount || 0);
  
  // Calculate advance amount
  if (this.paymentTerms.advancePercentage) {
    this.paymentTerms.advanceAmount = 
      (this.pricing.totalAmount * this.paymentTerms.advancePercentage) / 100;
  }
  
  // Calculate due date
  if (this.paymentTerms.creditDays && this.dates.orderDate) {
    const dueDate = new Date(this.dates.orderDate);
    dueDate.setDate(dueDate.getDate() + this.paymentTerms.creditDays);
    this.paymentTerms.dueDate = dueDate;
  }
  
  next();
});

// Virtual for total items
purchaseOrderSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total quantity
purchaseOrderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for received percentage
purchaseOrderSchema.virtual('receivedPercentage').get(function() {
  const totalQty = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const receivedQty = this.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
  return totalQty > 0 ? Math.round((receivedQty / totalQty) * 100) : 0;
});

// Virtual for payment status
purchaseOrderSchema.virtual('paymentStatus').get(function() {
  if (!this.pricing.paidAmount || this.pricing.paidAmount === 0) return 'unpaid';
  if (this.pricing.paidAmount < this.pricing.totalAmount) return 'partial';
  return 'paid';
});

// Method to check if overdue
purchaseOrderSchema.methods.isOverdue = function() {
  if (this.status === 'received' || this.status === 'cancelled' || this.status === 'closed') {
    return false;
  }
  return new Date() > new Date(this.dates.expectedDeliveryDate);
};

// Static method to get pending POs
purchaseOrderSchema.statics.getPending = async function() {
  return this.find({
    status: { $in: ['approved', 'sent', 'partial'] }
  })
  .populate('supplier', 'name code contact')
  .populate('warehouse', 'name code')
  .populate('createdBy', 'name email')
  .sort({ 'dates.expectedDeliveryDate': 1 });
};

// Static method to get overdue POs
purchaseOrderSchema.statics.getOverdue = async function() {
  return this.find({
    status: { $in: ['approved', 'sent', 'partial'] },
    'dates.expectedDeliveryDate': { $lt: new Date() }
  })
  .populate('supplier', 'name code contact')
  .populate('warehouse', 'name code')
  .sort({ 'dates.expectedDeliveryDate': 1 });
};

// Static method to get POs by supplier
purchaseOrderSchema.statics.getBySupplier = async function(supplierId) {
  return this.find({ supplier: supplierId })
    .populate('warehouse', 'name code')
    .populate('createdBy', 'name email')
    .sort({ 'dates.orderDate': -1 });
};

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
