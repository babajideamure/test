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
  });
});

// === Login ===
document.getElementById('submitLoginBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('loginError');

  if (!username || !password || !selectedRole) {
    error.innerText = 'Please fill all fields and select a role';
    error.style.display = 'block';
    return;
  }

  error.style.display = 'none';
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
  document.getElementById('userRole').innerText = capitalize(selectedRole);
  document.getElementById('userName').innerText = username;

  showDashboard(selectedRole);
});

// === Logout ===
function logout() {
  document.getElementById('appSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  loginForm.classList.remove('show');
  roleCards.forEach(c => c.classList.remove('selected'));
}

// === Show Correct Dashboard ===
function showDashboard(role) {
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

// === Render Dashboards ===
function renderEmployeeDashboard() {
  document.getElementById('employeeDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('submit')">Submit Request</button>
      <button class="tab-btn" onclick="showTab('history')">My Requests</button>
    </div>
    <div id="submitTab" class="tab-content">
      <form id="leaveForm">
        <div class="form-group"><label for="employeeId">Employee ID</label><input type="text" id="employeeId" /></div>
        <div class="form-group"><label for="employeeName">Name</label><input type="text" id="employeeName" /></div>
        <div class="form-group"><label for="leaveType">Leave Type</label>
          <select id="leaveType">
            <option value="">Select Leave Type</option>
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
          </select>
        </div>
        <div class="date-group">
          <div class="form-group"><label for="startDate">Start Date</label><input type="date" id="startDate" /></div>
          <div class="form-group"><label for="endDate">End Date</label><input type="date" id="endDate" /></div>
        </div>
        <div class="form-group"><label for="reason">Reason</label><textarea id="reason" rows="3"></textarea></div>
        <button type="submit">Submit</button>
      </form>
    </div>
    <div id="historyTab" class="tab-content" style="display: none;">
      <p style="text-align: center; color: #ccc;">Request history will appear here.</p>
    </div>
  `;

  document.getElementById('leaveForm').addEventListener('submit', e => {
    e.preventDefault();
    alert("Leave request submitted!");
  });
}

function renderManagerDashboard() {
  document.getElementById('managerDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('pending')">Pending Requests</button>
      <button class="tab-btn" onclick="showTab('team')">Team Overview</button>
    </div>
    <div id="pendingTab" class="tab-content">
      <p style="text-align:center; color:#ccc;">Pending leave requests go here.</p>
    </div>
    <div id="teamTab" class="tab-content" style="display:none;">
      <p style="text-align:center; color:#ccc;">Team calendar coming soon.</p>
    </div>
  `;
}

function renderHRDashboard() {
  document.getElementById('hrDashboard').innerHTML = `
    <div class="dashboard-tabs">
      <button class="tab-btn active" onclick="showTab('hrPending')">HR Approvals</button>
      <button class="tab-btn" onclick="showTab('reports')">Reports</button>
    </div>
    <div id="hrPendingTab" class="tab-content">
      <p style="text-align:center; color:#ccc;">HR pending requests will be here.</p>
    </div>
    <div id="reportsTab" class="tab-content" style="display:none;">
      <p style="text-align:center; color:#ccc;">Leave reports go here.</p>
    </div>
  `;
}
