// Posts management JavaScript

let currentPage = 1;
const postsPerPage = 10;
let allPosts = [];
let filteredPosts = [];
let editingPostId = null;

// Initialize posts page
document.addEventListener('DOMContentLoaded', () => {
  // Protect page
  if (!auth.protectPage()) return;
  
  // Load posts
  loadPosts();
  
  // Setup event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchPosts');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterPosts();
    }, 300));
  }
  
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      filterPosts();
    });
  }
  
  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      filterPosts();
    });
  }
  
  // Add post form
  const addPostForm = document.getElementById('addPostForm');
  if (addPostForm) {
    addPostForm.addEventListener('submit', handleAddPost);
  }
  
  // Edit post form
  const editPostForm = document.getElementById('editPostForm');
  if (editPostForm) {
    editPostForm.addEventListener('submit', handleEditPost);
  }
}

// Load posts
function loadPosts() {
  allPosts = db.getPosts();
  filteredPosts = [...allPosts];
  renderPosts();
}

// Filter posts
function filterPosts() {
  const searchTerm = document.getElementById('searchPosts')?.value.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const status = document.getElementById('statusFilter')?.value || 'all';
  
  filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                         post.content.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'all' || post.category === category;
    const matchesStatus = status === 'all' || post.status === status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  currentPage = 1;
  renderPosts();
}

// Render posts
function renderPosts() {
  const tbody = document.getElementById('postsTableBody');
  if (!tbody) return;
  
  if (filteredPosts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No posts found
        </td>
      </tr>
    `;
    return;
  }
  
  // Pagination
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  tbody.innerHTML = paginatedPosts.map(post => `
    <tr>
      <td class="px-6 py-4 font-medium">${post.title}</td>
      <td class="px-6 py-4">
        <span class="badge badge-info">${post.category}</span>
      </td>
      <td class="px-6 py-4">${post.author}</td>
      <td class="px-6 py-4">
        <span class="badge ${post.status === 'Published' ? 'badge-success' : 'badge-warning'}">
          ${post.status}
        </span>
      </td>
      <td class="px-6 py-4 text-gray-500 dark:text-gray-400">${formatDate(post.createdAt)}</td>
      <td class="px-6 py-4">
        <button onclick="openEditModal(${post.id})" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deletePost(${post.id})" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  renderPagination();
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  html += `
    <button 
      onclick="changePage(${currentPage - 1})" 
      ${currentPage === 1 ? 'disabled' : ''}
      class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `
        <button class="px-4 py-2 bg-purple-600 text-white rounded-lg">
          ${i}
        </button>
      `;
    } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `
        <button 
          onclick="changePage(${i})" 
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="px-2">...</span>`;
    }
  }
  
  // Next button
  html += `
    <button 
      onclick="changePage(${currentPage + 1})" 
      ${currentPage === totalPages ? 'disabled' : ''}
      class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  currentPage = page;
  renderPosts();
}

// Open add modal
function openAddModal() {
  document.getElementById('addPostForm').reset();
  Modal.open('addPostModal');
}

// Handle add post
function handleAddPost(e) {
  e.preventDefault();
  
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const category = document.getElementById('postCategory').value;
  const status = document.getElementById('postStatus').value;
  
  if (!title || !content) {
    Toast.show('Please fill in all fields', 'error');
    return;
  }
  
  const user = auth.getCurrentUser();
  const post = {
    title,
    content,
    category,
    status,
    author: user.name
  };
  
  db.addPost(post);
  Toast.show('Post created successfully', 'success');
  Modal.close('addPostModal');
  loadPosts();
}

// Open edit modal
function openEditModal(postId) {
  editingPostId = postId;
  const post = db.getPostById(postId);
  
  if (!post) {
    Toast.show('Post not found', 'error');
    return;
  }
  
  document.getElementById('editPostTitle').value = post.title;
  document.getElementById('editPostContent').value = post.content;
  document.getElementById('editPostCategory').value = post.category;
  document.getElementById('editPostStatus').value = post.status;
  
  Modal.open('editPostModal');
}

// Handle edit post
function handleEditPost(e) {
  e.preventDefault();
  
  const title = document.getElementById('editPostTitle').value.trim();
  const content = document.getElementById('editPostContent').value.trim();
  const category = document.getElementById('editPostCategory').value;
  const status = document.getElementById('editPostStatus').value;
  
  if (!title || !content) {
    Toast.show('Please fill in all fields', 'error');
    return;
  }
  
  const updatedPost = {
    title,
    content,
    category,
    status
  };
  
  db.updatePost(editingPostId, updatedPost);
  Toast.show('Post updated successfully', 'success');
  Modal.close('editPostModal');
  loadPosts();
}

// Delete post
function deletePost(postId) {
  if (!window.confirm('Are you sure you want to delete this post?')) {
    return;
  }
  
  db.deletePost(postId);
  Toast.show('Post deleted successfully', 'success');
  loadPosts();
}

// Logout
function logout() {
  if (window.confirm('Are you sure you want to logout?')) {
    auth.logout();
  }
}
