/**
 * Dock Scheduling Module
 * Handles appointment scheduling, dock door management, and carrier coordination
 */

// Sample appointments data
let appointments = [
  {
    id: 'APPT-001',
    carrier: 'FedEx',
    dockDoor: 'DOCK-01',
    type: 'Inbound',
    scheduledTime: new Date(2025, 10, 16, 8, 0),
    duration: 2,
    status: 'completed',
    trailerNumber: 'TRL-20241101',
    poNumber: 'PO-789456',
    notes: 'Priority shipment'
  },
  {
    id: 'APPT-002',
    carrier: 'UPS',
    dockDoor: 'DOCK-02',
    type: 'Outbound',
    scheduledTime: new Date(2025, 10, 16, 10, 0),
    duration: 1.5,
    status: 'in_progress',
    trailerNumber: 'TRL-20241102',
    poNumber: 'SO-123789',
    notes: ''
  },
  {
    id: 'APPT-003',
    carrier: 'XPO Logistics',
    dockDoor: 'DOCK-03',
    type: 'Live Load',
    scheduledTime: new Date(2025, 10, 16, 12, 0),
    duration: 2.5,
    status: 'scheduled',
    trailerNumber: 'TRL-20241103',
    poNumber: 'PO-456123',
    notes: 'Urgent delivery'
  },
  {
    id: 'APPT-004',
    carrier: 'YRC Freight',
    dockDoor: 'DOCK-04',
    type: 'Drop & Hook',
    scheduledTime: new Date(2025, 10, 16, 14, 0),
    duration: 1,
    status: 'scheduled',
    trailerNumber: 'TRL-20241104',
    poNumber: 'PO-987654',
    notes: ''
  },
  {
    id: 'APPT-005',
    carrier: 'Old Dominion',
    dockDoor: 'DOCK-01',
    type: 'Inbound',
    scheduledTime: new Date(2025, 10, 16, 16, 0),
    duration: 2,
    status: 'scheduled',
    trailerNumber: 'TRL-20241105',
    poNumber: 'PO-321654',
    notes: 'Fragile items'
  }
];

let currentFilter = 'all';
let selectedAppointment = null;
let currentDate = new Date(2025, 10, 16);

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  renderAppointmentsTable();
  renderDockTimeline();
  updateDateDisplay();
  setDefaultDate();
});

/**
 * Set default date for appointment form
 */
function setDefaultDate() {
  const today = new Date();
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    dateInput.value = today.toISOString().split('T')[0];
  }
}

/**
 * Update current date display
 */
function updateDateDisplay() {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    dateElement.textContent = currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

/**
 * Change date
 */
function changeDate(days) {
  currentDate.setDate(currentDate.getDate() + days);
  updateDateDisplay();
  renderDockTimeline();
  showNotification(`Viewing schedule for ${currentDate.toLocaleDateString()}`, 'info');
}

/**
 * Render appointments table
 */
function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  const filteredData = currentFilter === 'all' 
    ? appointments 
    : appointments.filter(a => a.dockDoor === currentFilter);
  
  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">No appointments found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredData.map(appt => {
    const statusBadge = getStatusBadge(appt.status);
    const timeStr = appt.scheduledTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <tr>
        <td><strong>${appt.id}</strong></td>
        <td>${appt.carrier}</td>
        <td>${appt.dockDoor}</td>
        <td>${appt.type}</td>
        <td>${timeStr}</td>
        <td>${appt.duration}h</td>
        <td>${statusBadge}</td>
        <td>${appt.trailerNumber || 'TBD'}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick="viewAppointmentDetails('${appt.id}')" title="View Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon btn-icon-danger" onclick="cancelAppointment('${appt.id}')" title="Cancel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render dock timeline
 */
function renderDockTimeline() {
  const timeline = document.getElementById('dockTimeline');
  const dockDoors = ['DOCK-01', 'DOCK-02', 'DOCK-03', 'DOCK-04', 'DOCK-05', 'DOCK-06'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 8 PM
  
  let html = '<div class="timeline-grid">';
  
  // Header row with hours
  html += '<div class="timeline-header">';
  html += '<div class="timeline-label">Dock</div>';
  hours.forEach(hour => {
    html += `<div class="timeline-hour">${hour}:00</div>`;
  });
  html += '</div>';
  
  // Dock rows
  dockDoors.forEach(dock => {
    html += '<div class="timeline-row">';
    html += `<div class="timeline-label">${dock}</div>`;
    html += '<div class="timeline-slots">';
    
    // Find appointments for this dock today
    const dockAppointments = appointments.filter(a => 
      a.dockDoor === dock && 
      a.scheduledTime.toDateString() === currentDate.toDateString()
    );
    
    dockAppointments.forEach(appt => {
      const startHour = appt.scheduledTime.getHours();
      const startMinute = appt.scheduledTime.getMinutes();
      const leftPercent = ((startHour - 6) + (startMinute / 60)) / 14 * 100;
      const widthPercent = appt.duration / 14 * 100;
      const statusClass = appt.status.replace('_', '-');
      
      html += `
        <div class="timeline-appointment ${statusClass}" 
             style="left: ${leftPercent}%; width: ${widthPercent}%;"
             onclick="viewAppointmentDetails('${appt.id}')"
             title="${appt.carrier} - ${appt.type}">
          <div class="appointment-carrier">${appt.carrier}</div>
          <div class="appointment-time">${appt.scheduledTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
    });
    
    html += '</div></div>';
  });
  
  html += '</div>';
  timeline.innerHTML = html;
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const badges = {
    'scheduled': '<span class="badge badge-info">Scheduled</span>',
    'in_progress': '<span class="badge badge-primary">In Progress</span>',
    'completed': '<span class="badge badge-success">Completed</span>',
    'cancelled': '<span class="badge badge-danger">Cancelled</span>'
  };
  return badges[status] || '<span class="badge badge-secondary">Unknown</span>';
}

/**
 * Filter appointments
 */
function filterAppointments() {
  currentFilter = document.getElementById('filterDock').value;
  renderAppointmentsTable();
}

/**
 * Open appointment modal
 */
function openAppointmentModal() {
  openModal('appointmentModal');
  document.getElementById('appointmentForm').reset();
  setDefaultDate();
}

/**
 * Submit appointment
 */
function submitAppointment(event) {
  event.preventDefault();
  
  const carrier = document.getElementById('carrierSelect').value;
  const type = document.getElementById('appointmentType').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const duration = parseFloat(document.getElementById('duration').value);
  const dockDoor = document.getElementById('dockDoorSelect').value || autoAssignDock(date, time, duration);
  const trailerNumber = document.getElementById('trailerNumberAppt').value;
  const poNumber = document.getElementById('poNumber').value;
  const notes = document.getElementById('appointmentNotes').value;
  
  const scheduledTime = new Date(`${date}T${time}`);
  
  const newAppointment = {
    id: `APPT-${String(appointments.length + 1).padStart(3, '0')}`,
    carrier,
    dockDoor,
    type,
    scheduledTime,
    duration,
    status: 'scheduled',
    trailerNumber,
    poNumber,
    notes
  };
  
  appointments.push(newAppointment);
  
  closeModal('appointmentModal');
  renderAppointmentsTable();
  renderDockTimeline();
  showNotification(`Appointment ${newAppointment.id} scheduled for ${dockDoor} at ${time}`, 'success');
}

/**
 * Auto-assign dock door
 */
function autoAssignDock(date, time, duration) {
  // Simple auto-assignment - in production, this would check availability
  const dockDoors = ['DOCK-01', 'DOCK-02', 'DOCK-03', 'DOCK-04', 'DOCK-05', 'DOCK-06'];
  return dockDoors[Math.floor(Math.random() * dockDoors.length)];
}

/**
 * View appointment details
 */
function viewAppointmentDetails(apptId) {
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;
  
  selectedAppointment = appt;
  
  document.getElementById('detailApptId').textContent = appt.id;
  document.getElementById('detailApptCarrier').textContent = appt.carrier;
  document.getElementById('detailApptDock').textContent = appt.dockDoor;
  document.getElementById('detailApptType').textContent = appt.type;
  document.getElementById('detailApptTime').textContent = appt.scheduledTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('detailApptDuration').textContent = `${appt.duration} hours`;
  document.getElementById('detailApptStatus').innerHTML = getStatusBadge(appt.status);
  document.getElementById('detailApptTrailer').textContent = appt.trailerNumber || 'TBD';
  document.getElementById('detailApptNotes').textContent = appt.notes || 'No notes';
  
  openModal('appointmentDetailsModal');
}

/**
 * Cancel appointment from details
 */
function cancelAppointmentFromDetails() {
  if (selectedAppointment) {
    cancelAppointment(selectedAppointment.id);
    closeModal('appointmentDetailsModal');
  }
}

/**
 * Cancel appointment
 */
function cancelAppointment(apptId) {
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;
  
  if (confirm(`Cancel appointment ${apptId} for ${appt.carrier}?`)) {
    appt.status = 'cancelled';
    renderAppointmentsTable();
    renderDockTimeline();
    showNotification(`Appointment ${apptId} cancelled`, 'success');
  }
}

/**
 * Export schedule
 */
function exportSchedule() {
  const csv = generateCSV();
  downloadCSV(csv, `dock-schedule-${currentDate.toISOString().split('T')[0]}.csv`);
  showNotification('Schedule exported successfully', 'success');
}

/**
 * Generate CSV
 */
function generateCSV() {
  const headers = ['Appt ID', 'Carrier', 'Dock Door', 'Type', 'Scheduled Time', 'Duration', 'Status', 'Trailer #'];
  const rows = appointments.map(a => [
    a.id,
    a.carrier,
    a.dockDoor,
    a.type,
    a.scheduledTime.toLocaleString(),
    `${a.duration}h`,
    a.status,
    a.trailerNumber || 'TBD'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Download CSV
 */
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Open modal
 */
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

/**
 * Toggle sidebar section
 */
function toggleSidebarSection(element) {
  const section = element.parentElement;
  const menu = section.querySelector('.sidebar-menu');
  const icon = element.querySelector('.sidebar-title-icon');
  
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
    icon.style.transform = 'rotate(0deg)';
  } else {
    menu.style.display = 'none';
    icon.style.transform = 'rotate(-90deg)';
  }
}
