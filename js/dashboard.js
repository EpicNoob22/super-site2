// Dashboard specific JavaScript

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
  // Protect page
  if (!auth.protectPage()) return;
  
  // Load user info
  loadUserInfo();
  
  // Load stats
  loadStats();
  
  // Load charts
  loadCharts();
  
  // Load recent activity
  loadRecentActivity();
});

// Load user info
function loadUserInfo() {
  const user = auth.getCurrentUser();
  const userNameElement = document.getElementById('userName');
  const userRoleElement = document.getElementById('userRole');
  const userAvatarElement = document.getElementById('userAvatar');
  
  if (user && userNameElement) {
    userNameElement.textContent = user.name;
  }
  
  if (user && userRoleElement) {
    userRoleElement.textContent = user.role;
  }
  
  if (user && userAvatarElement) {
    const initials = getInitials(user.name);
    const gradient = getAvatarGradient(user.name);
    userAvatarElement.innerHTML = `
      <div class="avatar bg-gradient-to-r ${gradient}">${initials}</div>
    `;
  }
}

// Load stats
function loadStats() {
  const users = db.getUsers();
  const posts = db.getPosts();
  const publishedPosts = posts.filter(p => p.status === 'Published');
  const activeUsers = users.filter(u => u.status === 'Active');
  
  // Animate counters
  animateCounter(document.getElementById('totalUsers'), users.length, 1500);
  animateCounter(document.getElementById('totalPosts'), posts.length, 1500);
  animateCounter(document.getElementById('publishedPosts'), publishedPosts.length, 1500);
  animateCounter(document.getElementById('activeUsers'), activeUsers.length, 1500);
}

// Load charts
function loadCharts() {
  loadPostsChart();
  loadUsersChart();
}

// Load posts chart (line chart)
function loadPostsChart() {
  const ctx = document.getElementById('postsChart');
  if (!ctx) return;
  
  // Generate mock data for the last 7 days
  const labels = [];
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    data.push(Math.floor(Math.random() * 20) + 5);
  }
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Posts Created',
        data: data,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Load users chart (doughnut chart)
function loadUsersChart() {
  const ctx = document.getElementById('usersChart');
  if (!ctx) return;
  
  const users = db.getUsers();
  const roles = {};
  
  users.forEach(user => {
    roles[user.role] = (roles[user.role] || 0) + 1;
  });
  
  const labels = Object.keys(roles);
  const data = Object.values(roles);
  const colors = [
    'rgb(102, 126, 234)',
    'rgb(246, 109, 155)',
    'rgb(79, 172, 254)',
    'rgb(67, 233, 123)'
  ];
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Load recent activity
function loadRecentActivity() {
  const tbody = document.getElementById('recentActivityTable');
  if (!tbody) return;
  
  const users = db.getUsers();
  const posts = db.getPosts();
  
  // Combine activities
  const activities = [];
  
  // Add user registrations
  users.slice(-5).forEach(user => {
    activities.push({
      type: 'user',
      user: user.name,
      action: 'Registered',
      time: user.createdAt
    });
  });
  
  // Add posts
  posts.slice(-5).forEach(post => {
    activities.push({
      type: 'post',
      user: post.author,
      action: `Created post: ${post.title}`,
      time: post.createdAt
    });
  });
  
  // Sort by time (most recent first)
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Display only the 5 most recent
  const recentActivities = activities.slice(0, 5);
  
  if (recentActivities.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent activity
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = recentActivities.map(activity => `
    <tr>
      <td class="px-6 py-4">
        <div class="flex items-center">
          <div class="avatar bg-gradient-to-r ${getAvatarGradient(activity.user)} mr-3">
            ${getInitials(activity.user)}
          </div>
          <span class="font-medium">${activity.user}</span>
        </div>
      </td>
      <td class="px-6 py-4">${activity.action}</td>
      <td class="px-6 py-4 text-gray-500 dark:text-gray-400">${timeAgo(activity.time)}</td>
    </tr>
  `).join('');
}

// Logout function
function logout() {
  if (window.confirm('Are you sure you want to logout?')) {
    auth.logout();
  }
}
