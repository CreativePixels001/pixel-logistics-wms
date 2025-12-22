const express = require('express');
const router = express.Router();
const auth = require('../middleware/authSimple');

// Mock data storage
let docks = [
  {
    id: 1,
    dockNumber: 'DOCK-001',
    type: 'receiving',
    status: 'available',
    capacity: 1,
    warehouseId: 'WH-001',
    location: 'North Wing',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    dockNumber: 'DOCK-002',
    type: 'shipping',
    status: 'occupied',
    capacity: 1,
    warehouseId: 'WH-001',
    location: 'South Wing',
    createdAt: new Date('2024-01-01')
  }
];

let appointments = [
  {
    id: 1,
    appointmentNumber: 'APT-001',
    dockId: 1,
    dockNumber: 'DOCK-001',
    type: 'receiving',
    carrierName: 'XYZ Logistics',
    vehicleNumber: 'MH-01-AB-1234',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91-9876543210',
    scheduledDate: new Date('2024-01-15'),
    scheduledTimeSlot: '09:00-11:00',
    expectedDuration: 120,
    status: 'scheduled',
    poNumber: 'PO-2024-001',
    expectedPallets: 10,
    checkInTime: null,
    checkOutTime: null,
    actualDuration: null,
    notes: 'Fragile items',
    createdAt: new Date('2024-01-10'),
    createdBy: 'user1'
  }
];

let yardVehicles = [
  {
    id: 1,
    vehicleNumber: 'MH-01-AB-1234',
    carrierName: 'XYZ Logistics',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91-9876543210',
    type: 'receiving',
    appointmentId: 1,
    dockNumber: 'DOCK-001',
    status: 'checked-in',
    checkInTime: new Date(),
    checkOutTime: null,
    duration: null,
    createdAt: new Date()
  }
];

let slottingRules = [
  {
    id: 1,
    ruleName: 'Fast Movers - Ground Floor',
    productCategory: 'Electronics',
    velocity: 'A',
    preferredZone: 'Zone-A',
    preferredLevel: 'Ground',
    storageType: 'pallet',
    priority: 1,
    active: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    ruleName: 'Slow Movers - Upper Level',
    productCategory: 'Seasonal',
    velocity: 'C',
    preferredZone: 'Zone-C',
    preferredLevel: 'Level-3',
    storageType: 'pallet',
    priority: 3,
    active: true,
    createdAt: new Date('2024-01-01')
  }
];

let laborShifts = [
  {
    id: 1,
    shiftName: 'Morning Shift',
    startTime: '06:00',
    endTime: '14:00',
    type: 'regular',
    warehouseId: 'WH-001',
    zone: 'All',
    requiredWorkers: 15,
    assignedWorkers: 12,
    date: new Date('2024-01-15'),
    status: 'active',
    createdAt: new Date('2024-01-10')
  },
  {
    id: 2,
    shiftName: 'Afternoon Shift',
    startTime: '14:00',
    endTime: '22:00',
    type: 'regular',
    warehouseId: 'WH-001',
    zone: 'All',
    requiredWorkers: 15,
    assignedWorkers: 15,
    date: new Date('2024-01-15'),
    status: 'active',
    createdAt: new Date('2024-01-10')
  }
];

let laborAssignments = [
  {
    id: 1,
    shiftId: 1,
    employeeId: 'EMP-001',
    employeeName: 'Amit Sharma',
    role: 'picker',
    zone: 'Zone-A',
    task: 'picking',
    assignedTime: new Date(),
    productivity: {
      tasksCompleted: 45,
      targetTasks: 50,
      efficiency: 90,
      accuracy: 98
    },
    status: 'active',
    createdAt: new Date()
  }
];

// ==================== DOCK MANAGEMENT ====================

// Create or update dock
router.post('/docks', auth, async (req, res) => {
  try {
    const { dockNumber, type, status, capacity, warehouseId, location } = req.body;

    // Validation
    if (!dockNumber || !type || !warehouseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Dock number, type, and warehouse ID are required' 
      });
    }

    // Check for duplicate dock number
    const existing = docks.find(d => d.dockNumber === dockNumber);
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Dock number already exists' 
      });
    }

    const newDock = {
      id: docks.length + 1,
      dockNumber,
      type, // receiving, shipping, both
      status: status || 'available', // available, occupied, maintenance, closed
      capacity: capacity || 1,
      warehouseId,
      location,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    docks.push(newDock);

    res.status(201).json({
      success: true,
      message: 'Dock created successfully',
      data: newDock
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating dock', 
      error: error.message 
    });
  }
});

// Get all docks with filters
router.get('/docks', auth, async (req, res) => {
  try {
    const { warehouseId, type, status } = req.query;

    let filteredDocks = [...docks];

    if (warehouseId) {
      filteredDocks = filteredDocks.filter(d => d.warehouseId === warehouseId);
    }
    if (type) {
      filteredDocks = filteredDocks.filter(d => d.type === type);
    }
    if (status) {
      filteredDocks = filteredDocks.filter(d => d.status === status);
    }

    res.json({
      success: true,
      data: filteredDocks,
      total: filteredDocks.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching docks', 
      error: error.message 
    });
  }
});

// Update dock status
router.put('/docks/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const dock = docks.find(d => d.id === parseInt(req.params.id));

    if (!dock) {
      return res.status(404).json({ 
        success: false,
        message: 'Dock not found' 
      });
    }

    dock.status = status;
    dock.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Dock status updated',
      data: dock
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating dock status', 
      error: error.message 
    });
  }
});

// ==================== DOCK SCHEDULING ====================

// Create dock appointment
router.post('/appointments', auth, async (req, res) => {
  try {
    const { 
      dockId, 
      type, 
      carrierName, 
      vehicleNumber, 
      driverName, 
      driverPhone,
      scheduledDate,
      scheduledTimeSlot,
      expectedDuration,
      poNumber,
      expectedPallets,
      notes
    } = req.body;

    // Validation
    if (!dockId || !type || !carrierName || !vehicleNumber || !scheduledDate || !scheduledTimeSlot) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }

    // Check if dock exists and is available
    const dock = docks.find(d => d.id === parseInt(dockId));
    if (!dock) {
      return res.status(404).json({ 
        success: false,
        message: 'Dock not found' 
      });
    }

    // Check for scheduling conflicts
    const conflict = appointments.find(apt => 
      apt.dockId === parseInt(dockId) &&
      apt.scheduledDate.toDateString() === new Date(scheduledDate).toDateString() &&
      apt.scheduledTimeSlot === scheduledTimeSlot &&
      apt.status !== 'cancelled'
    );

    if (conflict) {
      return res.status(400).json({ 
        success: false,
        message: 'Time slot already booked for this dock' 
      });
    }

    const newAppointment = {
      id: appointments.length + 1,
      appointmentNumber: `APT-${String(appointments.length + 1).padStart(3, '0')}`,
      dockId: parseInt(dockId),
      dockNumber: dock.dockNumber,
      type,
      carrierName,
      vehicleNumber,
      driverName,
      driverPhone,
      scheduledDate: new Date(scheduledDate),
      scheduledTimeSlot,
      expectedDuration: expectedDuration || 120,
      status: 'scheduled', // scheduled, checked-in, in-progress, completed, cancelled
      poNumber,
      expectedPallets,
      checkInTime: null,
      checkOutTime: null,
      actualDuration: null,
      notes,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    appointments.push(newAppointment);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
});

// Get dock schedule
router.get('/schedule', auth, async (req, res) => {
  try {
    const { date, dockId, status } = req.query;

    let filteredAppointments = [...appointments];

    if (date) {
      const searchDate = new Date(date);
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.scheduledDate.toDateString() === searchDate.toDateString()
      );
    }
    if (dockId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.dockId === parseInt(dockId));
    }
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    res.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching schedule', 
      error: error.message 
    });
  }
});

// Cancel appointment
router.put('/appointments/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = appointments.find(apt => apt.id === parseInt(req.params.id));

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user.userId;

    res.json({
      success: true,
      message: 'Appointment cancelled',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling appointment', 
      error: error.message 
    });
  }
});

// ==================== VEHICLE CHECK-IN/OUT ====================

// Vehicle check-in
router.post('/check-in', auth, async (req, res) => {
  try {
    const { appointmentId, vehicleNumber, actualArrivalTime } = req.body;

    if (!appointmentId || !vehicleNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Appointment ID and vehicle number are required' 
      });
    }

    const appointment = appointments.find(apt => apt.id === parseInt(appointmentId));
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Update appointment status
    appointment.status = 'checked-in';
    appointment.checkInTime = actualArrivalTime ? new Date(actualArrivalTime) : new Date();

    // Update dock status
    const dock = docks.find(d => d.id === appointment.dockId);
    if (dock) {
      dock.status = 'occupied';
    }

    // Create yard vehicle entry
    const yardVehicle = {
      id: yardVehicles.length + 1,
      vehicleNumber,
      carrierName: appointment.carrierName,
      driverName: appointment.driverName,
      driverPhone: appointment.driverPhone,
      type: appointment.type,
      appointmentId: appointment.id,
      dockNumber: appointment.dockNumber,
      status: 'checked-in',
      checkInTime: appointment.checkInTime,
      checkOutTime: null,
      duration: null,
      createdAt: new Date()
    };

    yardVehicles.push(yardVehicle);

    res.json({
      success: true,
      message: 'Vehicle checked in successfully',
      data: {
        appointment,
        yardVehicle
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking in vehicle', 
      error: error.message 
    });
  }
});

// Vehicle check-out
router.post('/check-out', auth, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Appointment ID is required' 
      });
    }

    const appointment = appointments.find(apt => apt.id === parseInt(appointmentId));
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Update appointment
    appointment.status = 'completed';
    appointment.checkOutTime = new Date();
    appointment.actualDuration = Math.floor((appointment.checkOutTime - appointment.checkInTime) / 60000); // minutes

    // Update dock status
    const dock = docks.find(d => d.id === appointment.dockId);
    if (dock) {
      dock.status = 'available';
    }

    // Update yard vehicle
    const yardVehicle = yardVehicles.find(v => v.appointmentId === appointment.id);
    if (yardVehicle) {
      yardVehicle.status = 'checked-out';
      yardVehicle.checkOutTime = appointment.checkOutTime;
      yardVehicle.duration = appointment.actualDuration;
    }

    res.json({
      success: true,
      message: 'Vehicle checked out successfully',
      data: {
        appointment,
        yardVehicle
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking out vehicle', 
      error: error.message 
    });
  }
});

// Get yard vehicles
router.get('/vehicles', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let filteredVehicles = [...yardVehicles];

    if (status) {
      filteredVehicles = filteredVehicles.filter(v => v.status === status);
    }

    res.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching yard vehicles', 
      error: error.message 
    });
  }
});

// ==================== SLOTTING OPTIMIZATION ====================

// Get slotting optimization recommendations
router.get('/slotting/optimize', auth, async (req, res) => {
  try {
    // Mock optimization algorithm
    const recommendations = [
      {
        productId: 'PROD-001',
        productName: 'iPhone 15 Pro',
        currentLocation: 'Zone-C-L3-R12-S04',
        recommendedLocation: 'Zone-A-L1-R02-S01',
        reason: 'High velocity product - move to ground floor picking zone',
        expectedImprovement: {
          pickingTime: '-35%',
          travelDistance: '-42%',
          productivity: '+28%'
        },
        priority: 'high',
        estimatedEffort: '2 hours'
      },
      {
        productId: 'PROD-002',
        productName: 'Christmas Decorations',
        currentLocation: 'Zone-A-L1-R05-S03',
        recommendedLocation: 'Zone-C-L3-R15-S08',
        reason: 'Seasonal slow mover - relocate to upper storage',
        expectedImprovement: {
          pickingTime: '+5%',
          travelDistance: '+8%',
          spaceUtilization: '+15%'
        },
        priority: 'medium',
        estimatedEffort: '1 hour'
      }
    ];

    res.json({
      success: true,
      data: {
        recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          highPriority: recommendations.filter(r => r.priority === 'high').length,
          mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
          lowPriority: recommendations.filter(r => r.priority === 'low').length,
          estimatedTotalEffort: '3 hours',
          expectedProductivityGain: '22%'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error generating optimization recommendations', 
      error: error.message 
    });
  }
});

// Get slotting rules
router.get('/slotting/rules', auth, async (req, res) => {
  try {
    const { active } = req.query;

    let filteredRules = [...slottingRules];

    if (active !== undefined) {
      filteredRules = filteredRules.filter(r => r.active === (active === 'true'));
    }

    res.json({
      success: true,
      data: filteredRules,
      total: filteredRules.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching slotting rules', 
      error: error.message 
    });
  }
});

// Create slotting rule
router.post('/slotting/rules', auth, async (req, res) => {
  try {
    const { ruleName, productCategory, velocity, preferredZone, preferredLevel, storageType, priority } = req.body;

    if (!ruleName || !productCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Rule name and product category are required' 
      });
    }

    const newRule = {
      id: slottingRules.length + 1,
      ruleName,
      productCategory,
      velocity, // A, B, C classification
      preferredZone,
      preferredLevel,
      storageType,
      priority: priority || 5,
      active: true,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    slottingRules.push(newRule);

    res.status(201).json({
      success: true,
      message: 'Slotting rule created successfully',
      data: newRule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating slotting rule', 
      error: error.message 
    });
  }
});

// ==================== LABOR MANAGEMENT ====================

// Create shift
router.post('/labor/shifts', auth, async (req, res) => {
  try {
    const { shiftName, startTime, endTime, type, warehouseId, zone, requiredWorkers, date } = req.body;

    if (!shiftName || !startTime || !endTime || !warehouseId || !date) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }

    const newShift = {
      id: laborShifts.length + 1,
      shiftName,
      startTime,
      endTime,
      type: type || 'regular', // regular, overtime, special
      warehouseId,
      zone: zone || 'All',
      requiredWorkers: requiredWorkers || 10,
      assignedWorkers: 0,
      date: new Date(date),
      status: 'active',
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    laborShifts.push(newShift);

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: newShift
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating shift', 
      error: error.message 
    });
  }
});

// Get shifts
router.get('/labor/shifts', auth, async (req, res) => {
  try {
    const { date, warehouseId, status } = req.query;

    let filteredShifts = [...laborShifts];

    if (date) {
      const searchDate = new Date(date);
      filteredShifts = filteredShifts.filter(s => 
        s.date.toDateString() === searchDate.toDateString()
      );
    }
    if (warehouseId) {
      filteredShifts = filteredShifts.filter(s => s.warehouseId === warehouseId);
    }
    if (status) {
      filteredShifts = filteredShifts.filter(s => s.status === status);
    }

    res.json({
      success: true,
      data: filteredShifts,
      total: filteredShifts.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching shifts', 
      error: error.message 
    });
  }
});

// Assign worker to shift
router.post('/labor/assignments', auth, async (req, res) => {
  try {
    const { shiftId, employeeId, employeeName, role, zone, task } = req.body;

    if (!shiftId || !employeeId || !employeeName || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }

    const shift = laborShifts.find(s => s.id === parseInt(shiftId));
    if (!shift) {
      return res.status(404).json({ 
        success: false,
        message: 'Shift not found' 
      });
    }

    // Check if already assigned
    const existing = laborAssignments.find(a => 
      a.shiftId === parseInt(shiftId) && a.employeeId === employeeId
    );
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Worker already assigned to this shift' 
      });
    }

    const newAssignment = {
      id: laborAssignments.length + 1,
      shiftId: parseInt(shiftId),
      employeeId,
      employeeName,
      role, // picker, packer, loader, supervisor, forklift-operator
      zone: zone || 'All',
      task: task || role,
      assignedTime: new Date(),
      productivity: {
        tasksCompleted: 0,
        targetTasks: 0,
        efficiency: 0,
        accuracy: 0
      },
      status: 'active',
      createdAt: new Date()
    };

    laborAssignments.push(newAssignment);

    // Update shift assigned workers count
    shift.assignedWorkers += 1;

    res.status(201).json({
      success: true,
      message: 'Worker assigned successfully',
      data: newAssignment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error assigning worker', 
      error: error.message 
    });
  }
});

// Get labor productivity
router.get('/labor/productivity', auth, async (req, res) => {
  try {
    const { shiftId, employeeId } = req.query;

    let filteredAssignments = [...laborAssignments];

    if (shiftId) {
      filteredAssignments = filteredAssignments.filter(a => a.shiftId === parseInt(shiftId));
    }
    if (employeeId) {
      filteredAssignments = filteredAssignments.filter(a => a.employeeId === employeeId);
    }

    // Calculate summary
    const totalWorkers = filteredAssignments.length;
    const avgEfficiency = totalWorkers > 0 
      ? filteredAssignments.reduce((sum, a) => sum + a.productivity.efficiency, 0) / totalWorkers 
      : 0;
    const avgAccuracy = totalWorkers > 0 
      ? filteredAssignments.reduce((sum, a) => sum + a.productivity.accuracy, 0) / totalWorkers 
      : 0;
    const totalTasksCompleted = filteredAssignments.reduce((sum, a) => sum + a.productivity.tasksCompleted, 0);

    res.json({
      success: true,
      data: {
        assignments: filteredAssignments,
        summary: {
          totalWorkers,
          avgEfficiency: avgEfficiency.toFixed(2),
          avgAccuracy: avgAccuracy.toFixed(2),
          totalTasksCompleted
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching productivity data', 
      error: error.message 
    });
  }
});

module.exports = router;
