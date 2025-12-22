/**
 * Database Setup Script
 * Creates initial database and tables
 */

const sequelize = require('./src/config/database');
const logger = require('./src/config/logger');

// Import all models
const User = require('./src/models/User');
const Inventory = require('./src/models/Inventory');

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');

    // Test connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established successfully');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ force: false }); // Set force: true to drop existing tables
    logger.info('✓ All models synchronized successfully');

    // Create default admin user
    const adminExists = await User.findOne({ where: { email: 'admin@pixellogistics.com' } });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@pixellogistics.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1-234-567-8900',
        department: 'Administration',
        status: 'active'
      });
      logger.info('✓ Default admin user created');
      logger.info('  Email: admin@pixellogistics.com');
      logger.info('  Password: Admin@123');
      logger.info('  IMPORTANT: Change this password immediately!');
    } else {
      logger.info('✓ Admin user already exists');
    }

    // Create sample inventory items
    const inventoryCount = await Inventory.count();
    
    if (inventoryCount === 0) {
      const sampleItems = [
        {
          itemCode: 'SKU-001',
          itemName: 'Laptop Dell XPS 15',
          description: 'High-performance laptop for business',
          category: 'Electronics',
          sku: 'DELL-XPS15-2024',
          barcode: '1234567890123',
          uom: 'EA',
          quantity: 50,
          availableQuantity: 45,
          allocatedQuantity: 5,
          reorderLevel: 10,
          reorderQuantity: 20,
          location: 'A-01',
          zone: 'A',
          aisle: '1',
          rack: '2',
          shelf: '3',
          unitPrice: 1299.99,
          weight: 2.5,
          dimensions: { length: 35, width: 25, height: 2 },
          supplier: 'Dell Inc.',
          status: 'available',
          condition: 'new'
        },
        {
          itemCode: 'SKU-002',
          itemName: 'Office Chair Ergonomic',
          description: 'Comfortable ergonomic office chair',
          category: 'Furniture',
          sku: 'CHAIR-ERG-001',
          barcode: '2234567890123',
          uom: 'EA',
          quantity: 100,
          availableQuantity: 85,
          allocatedQuantity: 15,
          reorderLevel: 20,
          reorderQuantity: 50,
          location: 'B-05',
          zone: 'B',
          aisle: '5',
          rack: '1',
          shelf: '1',
          unitPrice: 299.99,
          weight: 15.5,
          dimensions: { length: 70, width: 70, height: 120 },
          supplier: 'Office Supplies Co.',
          status: 'available',
          condition: 'new'
        },
        {
          itemCode: 'SKU-003',
          itemName: 'Printer HP LaserJet Pro',
          description: 'Professional laser printer',
          category: 'Electronics',
          sku: 'HP-LJ-PRO-M404',
          barcode: '3234567890123',
          uom: 'EA',
          quantity: 8,
          availableQuantity: 5,
          allocatedQuantity: 3,
          reorderLevel: 10,
          reorderQuantity: 15,
          location: 'A-03',
          zone: 'A',
          aisle: '3',
          rack: '1',
          shelf: '2',
          unitPrice: 449.99,
          weight: 10.2,
          dimensions: { length: 40, width: 35, height: 25 },
          supplier: 'HP Inc.',
          status: 'available',
          condition: 'new'
        }
      ];

      await Inventory.bulkCreate(sampleItems);
      logger.info(`✓ Created ${sampleItems.length} sample inventory items`);
    } else {
      logger.info('✓ Inventory data already exists');
    }

    logger.info('✅ Database setup completed successfully!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Update .env file with your database credentials');
    logger.info('2. Change the default admin password');
    logger.info('3. Run: npm run dev');
    logger.info('');

  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run setup
setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
