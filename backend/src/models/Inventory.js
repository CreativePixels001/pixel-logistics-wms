/**
 * Inventory Model
 * Manages warehouse inventory items
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  itemCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Item code is required' },
      len: {
        args: [3, 50],
        msg: 'Item code must be between 3-50 characters'
      }
    }
  },
  itemName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Item name is required' },
      len: {
        args: [2, 200],
        msg: 'Item name must be between 2-200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category is required' }
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  uom: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'EA',
    comment: 'Unit of Measure (EA, BOX, PALLET, etc.)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity cannot be negative'
      }
    }
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity available for picking (not allocated)'
  },
  allocatedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity allocated to orders'
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity reserved for pending orders'
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Minimum quantity before reorder'
  },
  reorderQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    comment: 'Standard reorder quantity'
  },
  location: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Primary warehouse location'
  },
  zone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Warehouse zone (A, B, C, etc.)'
  },
  aisle: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  rack: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  shelf: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  bin: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  totalValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Calculated: quantity * unitPrice'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Weight per unit in kg'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Length, Width, Height in cm'
  },
  supplier: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  supplierCode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lotNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  manufacturingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastMovementDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'allocated', 'on_hold', 'damaged', 'expired'),
    defaultValue: 'available'
  },
  condition: {
    type: DataTypes.ENUM('new', 'good', 'fair', 'damaged', 'defective'),
    defaultValue: 'new'
  },
  temperature: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Storage temperature requirement (ambient, refrigerated, frozen)'
  },
  hazmat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Hazardous material flag'
  },
  fragile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of tags for categorization'
  },
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional custom fields'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['itemCode'] },
    { fields: ['sku'] },
    { fields: ['barcode'] },
    { fields: ['category'] },
    { fields: ['location'] },
    { fields: ['status'] },
    { fields: ['expiryDate'] }
  ]
});

// Calculate total value before save
Inventory.beforeSave(async (inventory) => {
  if (inventory.quantity !== undefined && inventory.unitPrice !== undefined) {
    inventory.totalValue = (inventory.quantity * inventory.unitPrice).toFixed(2);
  }
});

// Instance Methods
Inventory.prototype.isLowStock = function() {
  return this.quantity <= this.reorderLevel;
};

Inventory.prototype.isExpired = function() {
  if (!this.expiryDate) return false;
  return new Date(this.expiryDate) < new Date();
};

Inventory.prototype.allocate = async function(quantity) {
  if (this.availableQuantity < quantity) {
    throw new Error('Insufficient available quantity');
  }
  this.availableQuantity -= quantity;
  this.allocatedQuantity += quantity;
  return await this.save();
};

Inventory.prototype.deallocate = async function(quantity) {
  if (this.allocatedQuantity < quantity) {
    throw new Error('Cannot deallocate more than allocated quantity');
  }
  this.allocatedQuantity -= quantity;
  this.availableQuantity += quantity;
  return await this.save();
};

Inventory.prototype.adjustQuantity = async function(quantity, reason) {
  const oldQuantity = this.quantity;
  this.quantity = quantity;
  this.availableQuantity = quantity - this.allocatedQuantity - this.reservedQuantity;
  this.lastMovementDate = new Date();
  await this.save();
  
  // Log the adjustment (you can create an InventoryLog model for this)
  return {
    oldQuantity,
    newQuantity: quantity,
    difference: quantity - oldQuantity,
    reason
  };
};

module.exports = Inventory;
