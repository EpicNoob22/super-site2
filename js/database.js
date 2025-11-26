// LocalStorage Database Manager
class Database {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Initialize with default admin user if not exists
    if (!localStorage.getItem('users')) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          password: this.hashPassword('admin123'),
          role: 'Admin',
          status: 'Active',
          avatar: null,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // Initialize posts if not exists
    if (!localStorage.getItem('posts')) {
      const defaultPosts = [
        {
          id: 1,
          title: 'Welcome to SuperSite',
          content: 'This is your first post. You can edit or delete it from the Posts Manager.',
          category: 'General',
          status: 'Published',
          author: 'Admin User',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('posts', JSON.stringify(defaultPosts));
    }

    // Initialize settings if not exists
    if (!localStorage.getItem('settings')) {
      const defaultSettings = {
        theme: 'light',
        siteName: 'SuperSite'
      };
      localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }
  }

  // Hash password (simple implementation for demo)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Users CRUD
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  addUser(user) {
    const users = this.getUsers();
    user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    user.createdAt = new Date().toISOString();
    if (user.password) {
      user.password = this.hashPassword(user.password);
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return user;
  }

  updateUser(id, updatedData) {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      if (updatedData.password) {
        updatedData.password = this.hashPassword(updatedData.password);
      }
      users[index] = { ...users[index], ...updatedData };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const filtered = users.filter(user => user.id !== id);
    localStorage.setItem('users', JSON.stringify(filtered));
    return true;
  }

  // Posts CRUD
  getPosts() {
    return JSON.parse(localStorage.getItem('posts') || '[]');
  }

  getPostById(id) {
    const posts = this.getPosts();
    return posts.find(post => post.id === id);
  }

  addPost(post) {
    const posts = this.getPosts();
    post.id = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    post.createdAt = new Date().toISOString();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    return post;
  }

  updatePost(id, updatedData) {
    const posts = this.getPosts();
    const index = posts.findIndex(post => post.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updatedData };
      localStorage.setItem('posts', JSON.stringify(posts));
      return posts[index];
    }
    return null;
  }

  deletePost(id) {
    const posts = this.getPosts();
    const filtered = posts.filter(post => post.id !== id);
    localStorage.setItem('posts', JSON.stringify(filtered));
    return true;
  }

  // Settings
  getSettings() {
    return JSON.parse(localStorage.getItem('settings') || '{}');
  }

  updateSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}

// Initialize database
const db = new Database();
