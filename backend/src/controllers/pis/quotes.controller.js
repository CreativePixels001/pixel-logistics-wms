/**
 * Quotes Controller
 * Handles quote generation and management
 */

const Quote = require('../../models/pis/Quote');
const Lead = require('../../models/pis/Lead');

// Premium calculation logic for different insurance types
const premiumCalculators = {
  health: (data) => {
    const { age, coverageAmount, coverageType, familyMembers = [], medicalInfo = {}, addons = [] } = data;
    
    // Age-based rates per lakh
    const ageRates = {
      '18-25': 500,
      '26-35': 650,
      '36-45': 850,
      '46-55': 1200,
      '56-65': 1800,
      '66-99': 2500
    };
    
    // Determine age group
    let ageGroup = '18-25';
    if (age >= 26 && age <= 35) ageGroup = '26-35';
    else if (age >= 36 && age <= 45) ageGroup = '36-45';
    else if (age >= 46 && age <= 55) ageGroup = '46-55';
    else if (age >= 56 && age <= 65) ageGroup = '56-65';
    else if (age >= 66) ageGroup = '66-99';
    
    const lakhs = coverageAmount / 100000;
    let basePremium = ageRates[ageGroup] * lakhs;
    
    // Family floater multiplier
    if (coverageType === 'family') {
      basePremium = basePremium * 1.6;
      basePremium += familyMembers.length * 3000;
    }
    
    // Pre-existing conditions
    if (medicalInfo.preExisting === 'yes' && medicalInfo.conditions?.length > 0) {
      basePremium = basePremium * 1.3;
    }
    
    // Tobacco usage
    if (medicalInfo.tobacco === 'yes') {
      basePremium = basePremium * 1.15;
    }
    
    return Math.round(basePremium);
  },
  
  motor: (data) => {
    // Simplified motor premium calculation
    const { vehicleDetails = {}, coverageAmount } = data;
    const vehicleAge = new Date().getFullYear() - (vehicleDetails.registrationYear || 2023);
    
    let basePremium = coverageAmount * 0.03; // 3% of IDV
    
    // Depreciation based on age
    const depreciationRates = [0, 5, 10, 15, 20, 25];
    const depreciation = depreciationRates[Math.min(vehicleAge, 5)] || 25;
    basePremium = basePremium * (1 - depreciation / 100);
    
    return Math.round(basePremium);
  },
  
  life: (data) => {
    const { age, coverageAmount } = data;
    const per1000 = age < 30 ? 5 : age < 40 ? 7 : age < 50 ? 10 : 15;
    return Math.round((coverageAmount / 1000) * per1000);
  },
  
  property: (data) => {
    const { coverageAmount } = data;
    return Math.round(coverageAmount * 0.005); // 0.5% of property value
  },
  
  travel: (data) => {
    const { coverageAmount } = data;
    return Math.round(coverageAmount * 0.02); // 2% of sum insured
  },
  
  business: (data) => {
    const { coverageAmount } = data;
    return Math.round(coverageAmount * 0.008); // 0.8% of coverage
  }
};

// Insurer configurations
const insurerConfigs = {
  health: [
    { id: 'star-health', name: 'Star Health Insurance', multiplier: 1.0, rating: 4.5, claimSettlement: 92 },
    { id: 'hdfc-ergo', name: 'HDFC ERGO Health', multiplier: 0.95, rating: 4.4, claimSettlement: 89 },
    { id: 'care-health', name: 'Care Health Insurance', multiplier: 1.05, rating: 4.6, claimSettlement: 94 },
    { id: 'max-bupa', name: 'Niva Bupa Health', multiplier: 0.98, rating: 4.3, claimSettlement: 88 },
    { id: 'icici-lombard', name: 'ICICI Lombard Health', multiplier: 1.02, rating: 4.5, claimSettlement: 91 }
  ],
  motor: [
    { id: 'bajaj-allianz', name: 'Bajaj Allianz Motor', multiplier: 1.0, rating: 4.4, claimSettlement: 90 },
    { id: 'icici-lombard', name: 'ICICI Lombard Motor', multiplier: 0.97, rating: 4.5, claimSettlement: 91 },
    { id: 'hdfc-ergo', name: 'HDFC ERGO Motor', multiplier: 1.03, rating: 4.3, claimSettlement: 87 },
    { id: 'reliance', name: 'Reliance General Motor', multiplier: 0.95, rating: 4.2, claimSettlement: 86 }
  ],
  life: [
    { id: 'lic', name: 'LIC of India', multiplier: 1.1, rating: 4.6, claimSettlement: 96 },
    { id: 'hdfc-life', name: 'HDFC Life', multiplier: 1.0, rating: 4.5, claimSettlement: 93 },
    { id: 'icici-prudential', name: 'ICICI Prudential Life', multiplier: 0.98, rating: 4.4, claimSettlement: 92 },
    { id: 'sbi-life', name: 'SBI Life', multiplier: 1.05, rating: 4.3, claimSettlement: 91 }
  ],
  property: [
    { id: 'oriental', name: 'Oriental Insurance', multiplier: 1.0, rating: 4.2, claimSettlement: 85 },
    { id: 'new-india', name: 'New India Assurance', multiplier: 0.95, rating: 4.3, claimSettlement: 87 },
    { id: 'united-india', name: 'United India Insurance', multiplier: 1.05, rating: 4.1, claimSettlement: 84 }
  ],
  travel: [
    { id: 'bajaj-allianz', name: 'Bajaj Allianz Travel', multiplier: 1.0, rating: 4.4, claimSettlement: 88 },
    { id: 'icici-lombard', name: 'ICICI Lombard Travel', multiplier: 0.95, rating: 4.5, claimSettlement: 90 },
    { id: 'reliance', name: 'Reliance Travel', multiplier: 1.05, rating: 4.2, claimSettlement: 85 }
  ],
  business: [
    { id: 'oriental', name: 'Oriental Insurance', multiplier: 1.0, rating: 4.2, claimSettlement: 86 },
    { id: 'national', name: 'National Insurance', multiplier: 0.98, rating: 4.3, claimSettlement: 88 },
    { id: 'united-india', name: 'United India Insurance', multiplier: 1.02, rating: 4.1, claimSettlement: 84 }
  ]
};

// Generate quotes from multiple insurers
const generateQuotes = async (req, res) => {
  try {
    const {
      customerInfo,
      insuranceType,
      coverageAmount,
      coverageType,
      familyMembers,
      medicalInfo,
      vehicleDetails,
      addons = [],
      source = 'website'
    } = req.body;

    // Validate required fields
    if (!customerInfo || !insuranceType || !coverageAmount) {
      return res.status(400).json({
        success: false,
        message: 'Customer info, insurance type, and coverage amount are required'
      });
    }

    // Calculate base premium
    const calculator = premiumCalculators[insuranceType];
    if (!calculator) {
      return res.status(400).json({
        success: false,
        message: 'Invalid insurance type'
      });
    }

    const basePremium = calculator({
      age: customerInfo.age,
      coverageAmount,
      coverageType,
      familyMembers,
      medicalInfo,
      vehicleDetails,
      addons
    });

    // Calculate addons cost
    const addonsCost = calculateAddonsCost(addons, insuranceType);

    // Generate quotes from multiple insurers
    const insurers = insurerConfigs[insuranceType] || [];
    const insurerQuotes = insurers.map(insurer => {
      const adjustedBase = Math.round(basePremium * insurer.multiplier);
      const subtotal = adjustedBase + addonsCost;
      const gst = Math.round(subtotal * 0.18);
      const totalPremium = subtotal + gst;

      return {
        insurerId: insurer.id,
        insurerName: insurer.name,
        planName: getPlanName(insuranceType, coverageAmount),
        premium: {
          basePremium: adjustedBase,
          addons: addonsCost,
          gst: gst,
          totalPremium: totalPremium
        },
        rating: insurer.rating,
        claimSettlement: insurer.claimSettlement,
        features: getFeatures(insuranceType, coverageAmount, insurer)
      };
    });

    // Sort by premium (lowest first)
    insurerQuotes.sort((a, b) => a.premium.totalPremium - b.premium.totalPremium);

    // Create quote document
    const quote = new Quote({
      customerInfo,
      insuranceType,
      coverageAmount,
      coverageType,
      familyMembers,
      medicalInfo,
      vehicleDetails,
      addons,
      insurerQuotes,
      calculatedPremium: insurerQuotes[0]?.premium.totalPremium || 0,
      source,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await quote.save();

    // Also create a lead
    const budgetCategory = quote.calculatedPremium < 10000 ? 'under-10k' :
                          quote.calculatedPremium < 25000 ? '10k-25k' :
                          quote.calculatedPremium < 50000 ? '25k-50k' :
                          quote.calculatedPremium < 100000 ? '50k-1l' : 'above-1l';

    const lead = new Lead({
      fullName: customerInfo.fullName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      interestType: insuranceType,
      source: source === 'quote-calculator' ? 'website' : source,
      budget: budgetCategory,
      priority: 'high',
      notes: `Quote generated: ${quote.quoteNumber}. Coverage: ₹${coverageAmount.toLocaleString()}. Estimated premium: ₹${quote.calculatedPremium.toLocaleString()}/year`
    });

    await lead.save();

    // Link lead to quote
    quote.leadId = lead._id;
    await quote.save();

    res.status(201).json({
      success: true,
      message: 'Quotes generated successfully',
      data: {
        quote,
        leadId: lead._id
      }
    });

  } catch (error) {
    console.error('Error generating quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating quotes',
      error: error.message
    });
  }
};

// Calculate addons cost
function calculateAddonsCost(addons, insuranceType) {
  const addonPrices = {
    health: {
      'critical-illness': 2500,
      'maternity': 3000,
      'room-upgrade': 1500,
      'no-claim-bonus': 1000,
      'annual-checkup': 800
    },
    motor: {
      'zero-depreciation': 1500,
      'engine-protect': 2000,
      'return-to-invoice': 2500,
      'roadside-assistance': 800,
      'ncb-protect': 1200
    }
  };

  const prices = addonPrices[insuranceType] || {};
  return addons.reduce((total, addon) => total + (prices[addon] || 0), 0);
}

// Get plan name based on coverage
function getPlanName(insuranceType, coverage) {
  if (insuranceType === 'health') {
    if (coverage >= 10000000) return 'Supreme Health Plan';
    if (coverage >= 5000000) return 'Premium Health Plus';
    if (coverage >= 2000000) return 'Super Saver Health';
    if (coverage >= 1000000) return 'Health Optima';
    if (coverage >= 500000) return 'Family Health Shield';
    return 'Essential Health Care';
  }
  return 'Standard Plan';
}

// Get features for insurer
function getFeatures(insuranceType, coverageAmount, insurer) {
  const features = {};
  
  if (insuranceType === 'health') {
    features.cashlessHospitals = 10000 + Math.round(Math.random() * 5000);
    features.roomRent = coverageAmount >= 1000000 ? 'No Limit' : '1% of SI';
    features.prePostHospitalization = '60+90 days';
    features.dayCare = 'Covered';
    features.ambulance = '₹2,000';
    features.noClaimBonus = '50%';
  }
  
  return features;
}

// Get all quotes
const getAllQuotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      insuranceType,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (insuranceType) query.insuranceType = insuranceType;
    
    if (search) {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const quotes = await Quote.find(query)
      .populate('leadId', 'fullName email phone status')
      .populate('policyId', 'policyNumber status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Quote.countDocuments(query);

    res.json({
      success: true,
      data: quotes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalQuotes: count
    });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotes',
      error: error.message
    });
  }
};

// Get quote by ID
const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('leadId')
      .populate('policyId');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Mark as viewed if not already
    if (quote.status === 'generated') {
      await quote.markAsViewed();
    }

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quote',
      error: error.message
    });
  }
};

// Get quote by quote number
const getQuoteByNumber = async (req, res) => {
  try {
    const quote = await Quote.findOne({ quoteNumber: req.params.quoteNumber })
      .populate('leadId')
      .populate('policyId');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quote',
      error: error.message
    });
  }
};

// Select a quote
const selectQuote = async (req, res) => {
  try {
    const { insurerId } = req.body;

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Quote has expired'
      });
    }

    await quote.selectQuote(insurerId);

    res.json({
      success: true,
      message: 'Quote selected successfully',
      data: quote
    });

  } catch (error) {
    console.error('Error selecting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error selecting quote',
      error: error.message
    });
  }
};

// Get quotes analytics
const getQuotesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await Quote.getAnalytics(startDate, endDate);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

module.exports = {
  generateQuotes,
  getAllQuotes,
  getQuoteById,
  getQuoteByNumber,
  selectQuote,
  getQuotesAnalytics
};
