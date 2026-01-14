// Complex user service with overly complex registration function
// This function has multiple responsibilities and is hard to understand

class UserService {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  // COMPLEX FUNCTION - NEEDS REFACTORING
  // This function does too much: validation, transformation, business logic, and storage
  registerUser(userData) {
    // Validate and process user registration
    if (!userData) {
      return { success: false, error: 'No user data provided' };
    }

    // Email validation and normalization
    if (!userData.email) {
      return { success: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, error: 'Invalid email format' };
    }
    const normalizedEmail = userData.email.toLowerCase().trim();

    // Check for duplicate email
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === normalizedEmail) {
        return { success: false, error: 'Email already registered' };
      }
    }

    // Password validation
    if (!userData.password) {
      return { success: false, error: 'Password is required' };
    }
    if (userData.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }
    let hasUpperCase = false;
    let hasLowerCase = false;
    let hasNumber = false;
    let hasSpecialChar = false;
    for (let i = 0; i < userData.password.length; i++) {
      const char = userData.password[i];
      if (char >= 'A' && char <= 'Z') hasUpperCase = true;
      if (char >= 'a' && char <= 'z') hasLowerCase = true;
      if (char >= '0' && char <= '9') hasNumber = true;
      if ('!@#$%^&*()_+-=[]{}|;:,.<>?'.includes(char)) hasSpecialChar = true;
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return { success: false, error: 'Password must contain uppercase, lowercase, number, and special character' };
    }

    // Username validation and normalization
    if (!userData.username) {
      return { success: false, error: 'Username is required' };
    }
    const normalizedUsername = userData.username.trim();
    if (normalizedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (normalizedUsername.length > 20) {
      return { success: false, error: 'Username must be at most 20 characters' };
    }
    for (let i = 0; i < normalizedUsername.length; i++) {
      const char = normalizedUsername[i];
      const isValid = (char >= 'a' && char <= 'z') ||
                     (char >= 'A' && char <= 'Z') ||
                     (char >= '0' && char <= '9') ||
                     char === '_' ||
                     char === '-';
      if (!isValid) {
        return { success: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
      }
    }

    // Check for duplicate username
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].username.toLowerCase() === normalizedUsername.toLowerCase()) {
        return { success: false, error: 'Username already taken' };
      }
    }

    // Age validation
    if (userData.age) {
      if (typeof userData.age !== 'number') {
        return { success: false, error: 'Age must be a number' };
      }
      if (userData.age < 13) {
        return { success: false, error: 'Must be at least 13 years old' };
      }
      if (userData.age > 120) {
        return { success: false, error: 'Invalid age' };
      }
    }

    // Phone number validation and normalization
    if (userData.phone) {
      let cleanPhone = '';
      for (let i = 0; i < userData.phone.length; i++) {
        const char = userData.phone[i];
        if (char >= '0' && char <= '9') {
          cleanPhone += char;
        }
      }
      if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
        return { success: false, error: 'Invalid phone number' };
      }
      userData.phone = cleanPhone;
    }

    // Create user object with all fields
    const newUser = {
      id: this.nextId++,
      email: normalizedEmail,
      username: normalizedUsername,
      password: userData.password, // In real app, this would be hashed
      age: userData.age || null,
      phone: userData.phone || null,
      createdAt: new Date().toISOString(),
      isActive: true,
      role: 'user',
      loginAttempts: 0,
      lastLogin: null
    };

    // Store user
    this.users.push(newUser);

    // Return success with user data (excluding password)
    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword,
      message: 'User registered successfully'
    };
  }

  getAllUsers() {
    return this.users.map(({ password, ...user }) => user);
  }
}

module.exports = UserService;
