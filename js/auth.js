// Authentication System
class Auth {
  constructor() {
    this.currentUser = this.getCurrentUser();
  }

  // Login user
  login(email, password, rememberMe = false) {
    const user = db.getUserByEmail(email);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const hashedPassword = db.hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Invalid password' };
    }

    if (user.status === 'Inactive') {
      return { success: false, message: 'Account is inactive' };
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem('session', JSON.stringify(session));
    } else {
      sessionStorage.setItem('session', JSON.stringify(session));
    }

    this.currentUser = session;
    return { success: true, user: session };
  }

  // Register user
  register(name, email, password) {
    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      name,
      email,
      password,
      role: 'User',
      status: 'Active',
      avatar: null
    };

    const user = db.addUser(newUser);
    
    return { success: true, message: 'Registration successful', user };
  }

  // Logout user
  logout() {
    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    this.currentUser = null;
    window.location.href = 'login.html';
  }

  // Get current user
  getCurrentUser() {
    const session = localStorage.getItem('session') || sessionStorage.getItem('session');
    if (session) {
      return JSON.parse(session);
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  // Protect page (redirect to login if not authenticated)
  protectPage() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // Update current user session
  updateSession(userData) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
      const storage = localStorage.getItem('session') ? localStorage : sessionStorage;
      storage.setItem('session', JSON.stringify(this.currentUser));
    }
  }
}

// Initialize auth
const auth = new Auth();
