// Users management JavaScript

let allUsers = [];
let filteredUsers = [];
let editingUserId = null;

// Initialize users page
document.addEventListener('DOMContentLoaded', () => {
  // Protect page
  if (!auth.protectPage()) return;
  
  // Check if user is admin
  const currentUser = auth.getCurrentUser();
  if (currentUser.role !== 'Admin') {
    Toast.show('Access denied. Admin privileges required.', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
    return;
  }
  
  // Load users
  loadUsers();
  
  // Setup event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchUsers');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterUsers();
    }, 300));
  }
  
  // Role filter
  const roleFilter = document.getElementById('roleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      filterUsers();
    });
  }
  
  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      filterUsers();
    });
  }
  
  // Add user form
  const addUserForm = document.getElementById('addUserForm');
  if (addUserForm) {
    addUserForm.addEventListener('submit', handleAddUser);
  }
  
  // Edit user form
  const editUserForm = document.getElementById('editUserForm');
  if (editUserForm) {
    editUserForm.addEventListener('submit', handleEditUser);
  }
}

// Load users
function loadUsers() {
  allUsers = db.getUsers();
  filteredUsers = [...allUsers];
  renderUsers();
}

// Filter users
function filterUsers() {
  const searchTerm = document.getElementById('searchUsers')?.value.toLowerCase() || '';
  const role = document.getElementById('roleFilter')?.value || 'all';
  const status = document.getElementById('statusFilter')?.value || 'all';
  
  filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                         user.email.toLowerCase().includes(searchTerm);
    const matchesRole = role === 'all' || user.role === role;
    const matchesStatus = status === 'all' || user.status === status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  renderUsers();
}

// Render users
function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No users found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredUsers.map(user => `
    <tr>
      <td class="px-6 py-4">
        <div class="flex items-center">
          <div class="avatar bg-gradient-to-r ${getAvatarGradient(user.name)} mr-3">
            ${getInitials(user.name)}
          </div>
          <div>
            <div class="font-medium">${user.name}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">${user.email}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <span class="badge ${
          user.role === 'Admin' ? 'badge-danger' : 
          user.role === 'Editor' ? 'badge-warning' : 
          'badge-info'
        }">
          ${user.role}
        </span>
      </td>
      <td class="px-6 py-4">
        <button 
          onclick="toggleUserStatus(${user.id})" 
          class="badge ${user.status === 'Active' ? 'badge-success' : 'badge-warning'} cursor-pointer hover:opacity-80"
        >
          ${user.status}
        </button>
      </td>
      <td class="px-6 py-4 text-gray-500 dark:text-gray-400">${formatDate(user.createdAt)}</td>
      <td class="px-6 py-4">
        <button onclick="openEditModal(${user.id})" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        ${user.id !== 1 ? `
          <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

// Open add modal
function openAddModal() {
  document.getElementById('addUserForm').reset();
  Modal.open('addUserModal');
}

// Handle add user
function handleAddUser(e) {
  e.preventDefault();
  
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  const status = document.getElementById('userStatus').value;
  
  if (!name || !email || !password) {
    Toast.show('Please fill in all fields', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    Toast.show('Please enter a valid email address', 'error');
    return;
  }
  
  if (!validatePassword(password)) {
    Toast.show('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Check if email already exists
  if (db.getUserByEmail(email)) {
    Toast.show('Email already exists', 'error');
    return;
  }
  
  const user = {
    name,
    email,
    password,
    role,
    status,
    avatar: null
  };
  
  db.addUser(user);
  Toast.show('User created successfully', 'success');
  Modal.close('addUserModal');
  loadUsers();
}

// Open edit modal
function openEditModal(userId) {
  editingUserId = userId;
  const user = db.getUserById(userId);
  
  if (!user) {
    Toast.show('User not found', 'error');
    return;
  }
  
  document.getElementById('editUserName').value = user.name;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserRole').value = user.role;
  document.getElementById('editUserStatus').value = user.status;
  
  Modal.open('editUserModal');
}

// Handle edit user
function handleEditUser(e) {
  e.preventDefault();
  
  const name = document.getElementById('editUserName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();
  const password = document.getElementById('editUserPassword').value;
  const role = document.getElementById('editUserRole').value;
  const status = document.getElementById('editUserStatus').value;
  
  if (!name || !email) {
    Toast.show('Please fill in all required fields', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    Toast.show('Please enter a valid email address', 'error');
    return;
  }
  
  // Check if email already exists for another user
  const existingUser = db.getUserByEmail(email);
  if (existingUser && existingUser.id !== editingUserId) {
    Toast.show('Email already exists', 'error');
    return;
  }
  
  const updatedUser = {
    name,
    email,
    role,
    status
  };
  
  // Only update password if provided
  if (password) {
    if (!validatePassword(password)) {
      Toast.show('Password must be at least 6 characters', 'error');
      return;
    }
    updatedUser.password = password;
  }
  
  db.updateUser(editingUserId, updatedUser);
  
  // Update session if editing current user
  const currentUser = auth.getCurrentUser();
  if (currentUser.userId === editingUserId) {
    auth.updateSession({ name, email, role });
  }
  
  Toast.show('User updated successfully', 'success');
  Modal.close('editUserModal');
  loadUsers();
}

// Toggle user status
function toggleUserStatus(userId) {
  const user = db.getUserById(userId);
  if (!user) return;
  
  // Don't allow disabling the default admin
  if (userId === 1) {
    Toast.show('Cannot change status of default admin', 'error');
    return;
  }
  
  const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
  db.updateUser(userId, { status: newStatus });
  
  Toast.show(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success');
  loadUsers();
}

// Delete user
function deleteUser(userId) {
  // Don't allow deleting the default admin
  if (userId === 1) {
    Toast.show('Cannot delete default admin', 'error');
    return;
  }
  
  if (!window.confirm('Are you sure you want to delete this user?')) {
    return;
  }
  
  db.deleteUser(userId);
  Toast.show('User deleted successfully', 'success');
  loadUsers();
}

// Logout
function logout() {
  if (window.confirm('Are you sure you want to logout?')) {
    auth.logout();
  }
}
