const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all products
// @route   GET /api/v1/wms/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.brand) filter.brand = req.query.brand;
  if (req.query.abc) filter['classification.abc'] = req.query.abc;
  if (req.query.velocity) filter['classification.velocity'] = req.query.velocity;
  
  // Search by name or description
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Low stock filter
  if (req.query.lowStock === 'true') {
    filter.$expr = { $lte: ['$totalStock', '$inventory.reorderPoint'] };
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/v1/wms/products/:id
// @access  Private
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/v1/wms/products
// @access  Private (Admin, Manager)
exports.createProduct = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.createdBy = req.user._id;
  req.body.updatedBy = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/wms/products/:id
// @access  Private (Admin, Manager)
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Add updatedBy
  req.body.updatedBy = req.user._id;

  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/wms/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Soft delete - change status to inactive
  product.status = 'discontinued';
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product discontinued successfully',
    data: {}
  });
});

// @desc    Get low stock products
// @route   GET /api/v1/wms/products/alerts/low-stock
// @access  Private
exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.getLowStockProducts();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get ABC analysis
// @route   GET /api/v1/wms/products/analysis/abc
// @access  Private
exports.getABCAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Product.getABCAnalysis();

  res.status(200).json({
    success: true,
    data: analysis
  });
});

// @desc    Get products by category
// @route   GET /api/v1/wms/products/category/:category
// @access  Private
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    category: req.params.category,
    status: 'active'
  });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Search products by barcode
// @route   GET /api/v1/wms/products/barcode/:barcode
// @access  Private
exports.getProductByBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ 
    $or: [
      { barcode: req.params.barcode },
      { 'variants.barcode': req.params.barcode }
    ]
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found with this barcode');
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Search products by SKU
// @route   GET /api/v1/wms/products/sku/:sku
// @access  Private
exports.getProductBySKU = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ 
    $or: [
      { sku: req.params.sku.toUpperCase() },
      { 'variants.sku': req.params.sku.toUpperCase() }
    ]
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found with this SKU');
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Add product variant
// @route   POST /api/v1/wms/products/:id/variants
// @access  Private (Admin, Manager)
exports.addVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Enable variants if not already
  product.hasVariants = true;
  product.variants.push(req.body);
  product.updatedBy = req.user._id;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Variant added successfully',
    data: product
  });
});

// @desc    Bulk import products
// @route   POST /api/v1/wms/products/bulk-import
// @access  Private (Admin, Manager)
exports.bulkImportProducts = asyncHandler(async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of products');
  }

  // Add createdBy to each product
  const productsWithUser = products.map(p => ({
    ...p,
    createdBy: req.user._id,
    updatedBy: req.user._id
  }));

  const result = await Product.insertMany(productsWithUser, { 
    ordered: false // Continue on error
  });

  res.status(201).json({
    success: true,
    message: `${result.length} products imported successfully`,
    count: result.length,
    data: result
  });
});

// @desc    Get product stock summary
// @route   GET /api/v1/wms/products/:id/stock
// @access  Private
exports.getProductStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select('productId name sku totalStock availableStock reservedStock inventory');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const stockData = {
    productId: product.productId,
    name: product.name,
    sku: product.sku,
    totalStock: product.totalStock,
    availableStock: product.availableStock,
    reservedStock: product.reservedStock,
    reorderPoint: product.inventory.reorderPoint,
    minStock: product.inventory.minStock,
    maxStock: product.inventory.maxStock,
    isLowStock: product.isLowStock(),
    needsReorder: product.needsReorder()
  };

  res.status(200).json({
    success: true,
    data: stockData
  });
});

// @desc    Update product classification
// @route   PUT /api/v1/wms/products/:id/classification
// @access  Private (Admin, Manager)
exports.updateClassification = asyncHandler(async (req, res) => {
  const { abc, velocity } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      'classification.abc': abc,
      'classification.velocity': velocity,
      updatedBy: req.user._id
    },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product classification updated',
    data: product
  });
});
