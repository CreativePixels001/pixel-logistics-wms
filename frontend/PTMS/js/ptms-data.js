/**
 * PTMS Mock Data Layer
 * Simulates backend API responses
 */

const PTMSData = {
  // Dashboard Statistics
  dashboardStats: {
    activeTrips: 32,
    employeesTransported: 2847,
    onTimePerformance: 94.8,
    monthlyCost: 2850000,
    totalVehicles: 45,
    activeVehicles: 32,
    totalDrivers: 58,
    activeDrivers: 32,
    pendingApprovals: 5,
    maintenanceDue: 3,
    complianceIssues: 2
  },

  // Recent Notifications
  notifications: [
    {
      id: 1,
      type: 'warning',
      title: 'Route Delay',
      message: 'Bus #MH-12-AB-5678 delayed by 15 mins due to traffic',
      time: '5 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Driver Check-in',
      message: 'Rajesh Kumar checked in for morning shift',
      time: '12 mins ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Trip Completed',
      message: 'Route Tech Park 1 completed successfully',
      time: '25 mins ago',
      read: true
    }
  ],

  // Vehicle Fleet
  vehicles: [
    {
      id: 'MH-12-AB-1234',
      model: 'Tata Starbus',
      capacity: 45,
      status: 'active',
      driver: 'Rajesh Kumar',
      route: 'Tech Park 1',
      lastService: '2025-10-15',
      nextService: '2025-12-15',
      fuelLevel: 75,
      location: { lat: 12.9716, lng: 77.5946 }
    },
    {
      id: 'MH-12-CD-5678',
      model: 'Ashok Leyland Viking',
      capacity: 52,
      status: 'active',
      driver: 'Suresh Patil',
      route: 'Tech Park 2',
      lastService: '2025-11-01',
      nextService: '2026-01-01',
      fuelLevel: 60,
      location: { lat: 13.0016, lng: 77.6246 }
    },
    {
      id: 'KA-01-EF-9012',
      model: 'Force Traveller',
      capacity: 26,
      status: 'maintenance',
      driver: null,
      route: null,
      lastService: '2025-11-10',
      nextService: '2025-11-25',
      fuelLevel: 30,
      location: null
    }
  ],

  // Employee Roster
  employees: [
    {
      id: 'EMP001',
      name: 'Amit Sharma',
      department: 'Engineering',
      location: 'Mumbai',
      shift: 'Morning',
      pickupPoint: 'Andheri West',
      routeAssigned: 'Tech Park 1',
      email: 'amit.sharma@company.com',
      phone: '+91 98765 43210'
    },
    {
      id: 'EMP002',
      name: 'Priya Desai',
      department: 'HR',
      location: 'Mumbai',
      shift: 'Morning',
      pickupPoint: 'Powai',
      routeAssigned: 'Tech Park 2',
      email: 'priya.desai@company.com',
      phone: '+91 98765 43211'
    }
  ],

  // Routes
  routes: [
    {
      id: 'RT001',
      name: 'Tech Park 1 - Morning',
      pickupPoints: 8,
      vehicles: 2,
      employees: 87,
      onTimePercentage: 96.5,
      avgDistance: 22.5,
      costPerTrip: 4500,
      status: 'active'
    },
    {
      id: 'RT002',
      name: 'Tech Park 2 - Morning',
      pickupPoints: 6,
      vehicles: 2,
      employees: 68,
      onTimePercentage: 94.2,
      avgDistance: 18.3,
      costPerTrip: 3800,
      status: 'active'
    }
  ],

  // Drivers
  drivers: [
    {
      id: 'DRV001',
      name: 'Rajesh Kumar',
      licenseNumber: 'MH-123456789',
      licenseExpiry: '2026-05-15',
      contactNumber: '+91 98765 00001',
      experience: '8 years',
      rating: 4.8,
      totalTrips: 1247,
      status: 'active',
      currentRoute: 'Tech Park 1'
    },
    {
      id: 'DRV002',
      name: 'Suresh Patil',
      licenseNumber: 'MH-987654321',
      licenseExpiry: '2025-12-20',
      contactNumber: '+91 98765 00002',
      experience: '12 years',
      rating: 4.9,
      totalTrips: 2156,
      status: 'active',
      currentRoute: 'Tech Park 2'
    }
  ],

  // Compliance Records
  compliance: [
    {
      vehicleId: 'MH-12-AB-1234',
      type: 'Insurance',
      status: 'active',
      issueDate: '2025-01-01',
      expiryDate: '2026-01-01',
      documentNumber: 'INS-2025-001'
    },
    {
      vehicleId: 'MH-12-CD-5678',
      type: 'Fitness Certificate',
      status: 'expiring',
      issueDate: '2024-11-01',
      expiryDate: '2025-12-15',
      documentNumber: 'FC-2024-002'
    },
    {
      vehicleId: 'KA-01-EF-9012',
      type: 'Pollution Certificate',
      status: 'expired',
      issueDate: '2024-05-01',
      expiryDate: '2025-11-01',
      documentNumber: 'PUC-2024-003'
    }
  ],

  // Methods to fetch data
  getDashboardStats() {
    return this.dashboardStats;
  },

  getVehicles(status = null) {
    if (status) {
      return this.vehicles.filter(v => v.status === status);
    }
    return this.vehicles;
  },

  getEmployees(filters = {}) {
    let filtered = [...this.employees];
    
    if (filters.location) {
      filtered = filtered.filter(e => e.location === filters.location);
    }
    if (filters.department) {
      filtered = filtered.filter(e => e.department === filters.department);
    }
    if (filters.shift) {
      filtered = filtered.filter(e => e.shift === filters.shift);
    }
    
    return filtered;
  },

  getRoutes() {
    return this.routes;
  },

  getDrivers(status = null) {
    if (status) {
      return this.drivers.filter(d => d.status === status);
    }
    return this.drivers;
  },

  getCompliance(status = null) {
    if (status) {
      return this.compliance.filter(c => c.status === status);
    }
    return this.compliance;
  },

  getNotifications(unreadOnly = false) {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  },

  // Simulate real-time updates
  simulateRealTimeUpdate() {
    // Update random vehicle location
    const activeVehicles = this.getVehicles('active');
    if (activeVehicles.length > 0) {
      const randomVehicle = activeVehicles[Math.floor(Math.random() * activeVehicles.length)];
      if (randomVehicle.location) {
        randomVehicle.location.lat += (Math.random() - 0.5) * 0.002;
        randomVehicle.location.lng += (Math.random() - 0.5) * 0.002;
      }
    }

    // Update fuel levels
    this.vehicles.forEach(vehicle => {
      if (vehicle.status === 'active' && vehicle.fuelLevel > 0) {
        vehicle.fuelLevel = Math.max(0, vehicle.fuelLevel - Math.random() * 0.5);
      }
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PTMSData;
}
