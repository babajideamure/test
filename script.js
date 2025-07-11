// === User Database (In production, this would be server-side) ===
const USERS_DATABASE = {
  // Employees
  'emp001': { username: 'emp001', password: 'emp123', role: 'employee', name: 'Chioma Kem' },
  'emp002': { username: 'emp002', password: 'emp456', role: 'employee', name: 'Peter Edwin' },
  'emp003': { username: 'emp003', password: 'emp789', role: 'employee', name: 'Damilare Kuku' },
  
  // Managers
  'mgr001': { username: 'mgr001', password: 'mgr123', role: 'manager', name: 'Babajide Amure' },
  'mgr002': { username: 'mgr002', password: 'mgr456', role: 'manager', name: 'Olatunde Ojo' },
  
  // HR Personnel
  'hr001': { username: 'hr001', password: 'hr123', role: 'hr', name: 'Bintu Ajala' },
  'hr002': { username: 'hr002', password: 'hr456', role: 'hr', name: 'Aaeesha Amure'}
};

// === Current Session ===
let currentUser = null;

// === Role Selection ===
const roleCards = document.querySelectorAll('.role-card');
const loginForm = document.getElementById('loginForm');
let selectedRole = null;

roleCards.forEach(card => {
  card.addEventListener('click', () => {
    roleCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedRole = card.getAttribute('data-role');
    loginForm.classList.add('show');
    
    // Clear previous login errors when switching roles
    const error = document.getElementById('loginError');
    error.style.display = 'none';
    
    // Show role-specific login hint
    showLoginHint(selectedRole);
  });
});

// === Show Login Hints ===
function showLoginHint(role) {
  const hintDiv = document.getElementById('loginHint') || createLoginHint();
  
  const hints = {
    employee: 'Employee Login - Use: emp001/emp123, emp002/emp456, or emp003/emp789',
    manager: 'Manager Login - Use: mgr001/mgr123 or mgr002/mgr456',
    hr: 'HR Login - Use: hr001/hr123 or hr002/hr456'
  };
  
  hintDiv.innerHTML = `<small style="color: #6c757d;">${hints[role]}</small>`;
}

function createLoginHint() {
  const hintDiv = document.createElement('div');
  hintDiv.id = 'loginHint';
  hintDiv.style.marginBottom = '15px';
  hintDiv.style.textAlign = 'center';
  
  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitLoginBtn');
  loginForm.insertBefore(hintDiv, submitBtn);
  
  return hintDiv;
}

// === Storage Functions ===
const STORAGE_KEY = "jaydeploy_leave_requests";

function getLeaveRequests() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLeaveRequest(request) {
  const requests = getLeaveRequests();
  requests.push(request);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function filterRequestsBy(criteria) {
  return getLeaveRequests().filter(criteria);
}

// === Authentication Functions ===
function authenticateUser(username, password, selectedRole) {
  const user = USERS_DATABASE[username];
  
  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Invalid username or password' };
  }
  
  if (user.role !== selectedRole) {
    return { success: false, message: `Access denied. This user is not authorized for ${selectedRole} role.` };
  }
  
  return { success: true, user: user };
}

function hasPermission(requiredRole) {
  if (!currentUser) return false;
  
  const roleHierarchy = {
    'employee': ['employee'],
    'manager': ['employee', 'manager'],
    'hr': ['employee', 'manager', 'hr']
  };
  
  return roleHierarchy[currentUser.role].includes(requiredRole);
}

// === Enhanced Login ===
document.getElementById('submitLoginBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('loginError');

  if (!username || !password || !selectedRole) {
    showLoginError('Please fill all fields and select a role');
    return;
  }

  // Authenticate user
  const authResult = authenticateUser(username, password, selectedRole);
  
  if (!authResult.success) {
    showLoginError(authResult.message);
    return;
  }

  // Login successful
  currentUser = authResult.user;
  error.style.display = 'none';
  
  // Hide login, show app
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
  
  // Update UI with user info
  document.getElementById('userRole').innerText = capitalize(currentUser.role);
  document.getElementById('userName').innerText = currentUser.name;
  
  // Show appropriate dashboard
  showDashboard(currentUser.role);
  
  // Show welcome message
  showWelcomeMessage();
});

// === Login Error Display ===
function showLoginError(message) {
  const error = document.getElementById('loginError');
  error.innerText = message;
  error.style.display = 'block';
  
  // Clear error after 5 seconds
  setTimeout(() => {
    error.style.display = 'none';
  }, 5000);
}

// === Welcome Message ===
function showWelcomeMessage() {
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'welcome-message';
  welcomeDiv.style.cssText = `
    background: #28a745;
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    animation: slideIn 0.5s ease-out;
  `;
  welcomeDiv.innerHTML = `
    <strong>Welcome, ${currentUser.name}!</strong><br>
    <small>You are logged in as ${capitalize(currentUser.role)}</small>
  `;
  
  const appSection = document.getElementById('appSection');
  const header = appSection.querySelector('h1');
  appSection.insertBefore(welcomeDiv, header.nextSibling);
  
  // Remove welcome message after 4 seconds
  setTimeout(() => {
    welcomeDiv.remove();
  }, 4000);
}

// === Enhanced Logout ===
function logout() {
  currentUser = null;
  selectedRole = null;
  
  document.getElementById('appSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  loginForm.classList.remove('show');
  roleCards.forEach(c => c.classList.remove('selected'));
  
  // Clear login hint
  const hintDiv = document.getElementById('loginHint');
  if (hintDiv) hintDiv.remove();
  
  // Clear any error messages
  document.getElementById('loginError').style.display = 'none';
}

// === Show Correct Dashboard ===
function showDashboard(role) {
  // Security check
  if (!currentUser || currentUser.role !== role) {
    logout();
    return;
  }
  
  document.querySelectorAll('.dashboard-section').forEach(section => section.style.display = 'none');
  document.getElementById(`${role}Dashboard`).style.display = 'block';

  if (role === 'employee') renderEmployeeDashboard();
  if (role === 'manager') renderManagerDashboard();
  if (role === 'hr') renderHRDashboard();
}

// === Capitalize helper ===
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// === Tabs ===
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(`${tabId}Tab`).style.display = 'block';

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// === Form Validation Helper ===
function validateLeaveForm() {
  const employeeId = document.getElementById('employeeId').value.trim();
  const employeeName = document.getElementById('employeeName').value.trim();
  const leaveType = document.getElementById('leaveType').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const reason = document.getElementById('reason').value.trim();

  // Clear previous error messages
  clearErrorMessages();

  let isValid = true;
  const errors = [];

  // Validate Employee ID
  if (!employeeId) {
    showFieldError('employeeId', 'Employee ID is required');
    errors.push('Employee ID is required');
    isValid = false;
  }

  // Validate Employee Name
  if (!employeeName) {
    showFieldError('employeeName', 'Employee Name is required');
    errors.push('Employee Name is required');
    isValid = false;
  }

  // Validate Leave Type
  if (!leaveType) {
    showFieldError('leaveType', 'Please select a leave type');
    errors.push('Leave Type is required');
    isValid = false;
  }

  // Validate Start Date
  if (!startDate) {
    showFieldError('startDate', 'Start date is required');
    errors.push('Start date is required');
    isValid = false;
  }

  // Validate End Date
  if (!endDate) {
    showFieldError('endDate', 'End date is required');
    errors.push('End date is required');
    isValid = false;
  }

  // Validate Date Range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    if (start > end) {
      showFieldError('endDate', 'End date must be after start date');
      errors.push('End date must be after start date');
      isValid = false;
    }

    if (start < today) {
      showFieldError('startDate', 'Start date cannot be in the past');
      errors.push('Start date cannot be in the past');
      isValid = false;
    }
  }

  // Validate Reason
  if (!reason) {
    showFieldError('reason', 'Reason is required');
    errors.push('Reason is required');
    isValid = false;
  } else if (reason.length < 10) {
    showFieldError('reason', 'Reason must be at least 10 characters long');
    errors.push('Reason must be at least 10 characters long');
    isValid = false;
  }

  // Show summary error if validation fails
  if (!isValid) {
    showSummaryError(errors);
  }

  return isValid;
}

// === Error Display Functions ===
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.style.borderColor = '#e74c3c';
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.style.color = '#e74c3c';
  errorDiv.style.fontSize = '0.85rem';
  errorDiv.style.marginTop = '5px';
  errorDiv.textContent = message;
  
  field.parentNode.appendChild(errorDiv);
}

function showSummaryError(errors) {
  // Remove existing summary error
  const existingSummary = document.querySelector('.form-summary-error');
  if (existingSummary) {
    existingSummary.remove();
  }
  
  // Create summary error
  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'form-summary-error error-message';
  summaryDiv.style.display = 'block';
  summaryDiv.style.marginBottom = '20px';
  summaryDiv.innerHTML = `
    <strong>Please fix the following errors:</strong><br>
    ${errors.map(error => `• ${error}`).join('<br>')}
  `;
  
  const form = document.getElementById('leaveForm');
  form.insertBefore(summaryDiv, form.firstChild);
}

function clearErrorMessages() {
  // Clear field errors
  document.querySelectorAll('.field-error').forEach(error => error.remove());
  
  // Clear summary error
  const summaryError = document.querySelector('.form-summary-error');
  if (summaryError) {
    summaryError.remove();
  }
  
  // Reset field border colors
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.style.borderColor = '#3a3a3a';
  });
}

// === Success Message ===
function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.display = 'block';
  successDiv.style.marginBottom = '20px';
  successDiv.innerHTML = `
    <strong>Success!</strong> Your leave request has been submitted successfully.
  `;
  
  const form = document.getElementById('leaveForm');
  form.insertBefore(successDiv, form.firstChild);
  
  // Remove success message after 5 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// === Reset Form ===
function resetLeaveForm() {
  document.getElementById('leaveForm').reset();
  clearErrorMessages();
}

// === Enhanced Employee Dashboard ===
function renderEmployeeDashboard() {
  // Security check
  if (!hasPermission('employee')) {
    logout();
    return;
  }
  
  document.getElementById('employeeDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('submit')">Submit Request</button>
      <button class="tab-btn" onclick="showTab('history')">My Requests</button>
    </div>
    <div id="submitTab" class="tab-content">
      <form id="leaveForm">
        <div class="form-group">
          <label for="employeeId">Employee ID <span class="required">*</span></label>
          <input type="text" id="employeeId" value="${currentUser.username}" readonly style="background: #f8f9fa;" />
        </div>
        <div class="form-group">
          <label for="employeeName">Name <span class="required">*</span></label>
          <input type="text" id="employeeName" value="${currentUser.name}" readonly style="background: #f8f9fa;" />
        </div>
        <div class="form-group">
          <label for="leaveType">Leave Type <span class="required">*</span></label>
          <select id="leaveType" required>
            <option value="">Select Leave Type</option>
            <option value="Maternity">Maternity Leave</option>
            <option value="Paternity">Paternity Leave</option>
            <option value="Emergency">Emergency Leave</option>
            <option value="Exam">Exam Leave</option>
            <option value="Compassionate">Compassionate Leave</option>
            <option value="Annual">Annual Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Casual">Casual Leave</option>
          </select>
        </div>
        <div class="date-group">
          <div class="form-group">
            <label for="startDate">Start Date <span class="required">*</span></label>
            <input type="date" id="startDate" required />
          </div>
          <div class="form-group">
            <label for="endDate">End Date <span class="required">*</span></label>
            <input type="date" id="endDate" required />
          </div>
        </div>
        <div class="form-group">
          <label for="reason">Reason <span class="required">*</span></label>
          <textarea id="reason" rows="3" required placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"></textarea>
        </div>
        <div class="form-group">
          <button type="submit">Submit Leave Request</button>
          <button type="button" onclick="resetLeaveForm()" style="background: #6c757d; margin-top: 10px;">Reset Form</button>
        </div>
      </form>
    </div>
    <div id="historyTab" class="tab-content" style="display: none;">
      <div id="requestHistoryTable" style="overflow-x:auto;">
        <p style="text-align:center; color:#ccc;">Your leave request history will appear here.</p>
      </div>
    </div>
  `;

  // Add enhanced form validation
  document.getElementById('leaveForm').addEventListener('submit', e => {
    e.preventDefault();
    
    if (validateLeaveForm()) {
      const newRequest = {
        id: Date.now(),
        employeeId: currentUser.username,
        name: currentUser.name,
        leaveType: document.getElementById('leaveType').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        reason: document.getElementById('reason').value.trim(),
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };

      saveLeaveRequest(newRequest);
      showSuccessMessage();
      resetLeaveForm();
    }
  });

  // Add real-time validation feedback
  const fields = ['leaveType', 'startDate', 'endDate', 'reason'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.addEventListener('blur', () => {
      // Clear previous error for this field
      const existingError = field.parentNode.querySelector('.field-error');
      if (existingError) {
        existingError.remove();
      }
      field.style.borderColor = '#3a3a3a';
      
      // Validate individual field
      if (fieldId === 'leaveType' && !field.value) {
        showFieldError(fieldId, 'Please select a leave type');
      } else if (fieldId === 'reason' && field.value.trim() && field.value.trim().length < 10) {
        showFieldError(fieldId, 'Reason must be at least 10 characters long');
      }
    });
  });
}

// === Enhanced Manager Dashboard ===
function renderManagerDashboard() {
  // Security check
  if (!hasPermission('manager')) {
    logout();
    return;
  }
  
  document.getElementById('managerDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('pending')">Pending Requests</button>
      <button class="tab-btn" onclick="showTab('team')">Team Overview</button>
    </div>
    <div id="pendingTab" class="tab-content">
      <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="color: #fff; margin-bottom: 10px;">Manager Dashboard</h3>
        <p style="color: #ccc;">Welcome, ${currentUser.name}!</p>
        <p style="color: #ccc;">Pending leave requests management will be available here.</p>
      </div>
    </div>
    <div id="teamTab" class="tab-content" style="display:none;">
      <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="color: #fff; margin-bottom: 10px;">Team Overview</h3>
        <p style="color: #ccc;">Team calendar and leave overview coming soon.</p>
      </div>
    </div>
  `;
}

// === Enhanced HR Dashboard ===
function renderHRDashboard() {
  // Security check
  if (!hasPermission('hr')) {
    logout();
    return;
  }
  
  document.getElementById('hrDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('hrPending')">HR Approvals</button>
      <button class="tab-btn" onclick="showTab('reports')">Reports</button>
    </div>
    <div id="hrPendingTab" class="tab-content">
      <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="color: #fff; margin-bottom: 10px;">HR Dashboard</h3>
        <p style="color: #ccc;">Welcome, ${currentUser.name}!</p>
        <p style="color: #ccc;">HR approval workflow and employee management will be available here.</p>
      </div>
    </div>
    <div id="reportsTab" class="tab-content" style="display:none;">
      <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="color: #fff; margin-bottom: 10px;">Leave Reports</h3>
        <p style="color: #ccc;">Comprehensive leave reports and analytics coming soon.</p>
      </div>
    </div>
  `;
}

// === Initialize Session Check ===
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in (for page refresh)
  if (currentUser) {
    showDashboard(currentUser.role);
  }
});