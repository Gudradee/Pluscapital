// Refactored user service with improved clarity and separation of concerns

// ============================================================================
// VALIDATORS - Each validator has a single responsibility
// ============================================================================

class EmailValidator {
  static validate(email) {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }

  static normalize(email) {
    return email.toLowerCase().trim();
  }
}

class PasswordValidator {
  static validate(password) {
    if (!password) {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return {
        valid: false,
        error: 'Password must contain uppercase, lowercase, number, and special character'
      };
    }

    return { valid: true };
  }
}

class UsernameValidator {
  static validate(username) {
    if (!username) {
      return { valid: false, error: 'Username is required' };
    }

    const normalized = username.trim();

    if (normalized.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (normalized.length > 20) {
      return { valid: false, error: 'Username must be at most 20 characters' };
    }

    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(normalized);
    if (!isValidFormat) {
      return {
        valid: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      };
    }

    return { valid: true };
  }

  static normalize(username) {
    return username.trim();
  }
}

class AgeValidator {
  static validate(age) {
    if (age === null || age === undefined) {
      return { valid: true }; // Age is optional
    }

    if (typeof age !== 'number') {
      return { valid: false, error: 'Age must be a number' };
    }

    if (age < 13) {
      return { valid: false, error: 'Must be at least 13 years old' };
    }

    if (age > 120) {
      return { valid: false, error: 'Invalid age' };
    }

    return { valid: true };
  }
}

class PhoneValidator {
  static validate(phone) {
    if (!phone) {
      return { valid: true }; // Phone is optional
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      return { valid: false, error: 'Invalid phone number' };
    }

    return { valid: true };
  }

  static normalize(phone) {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
  }
}

// ============================================================================
// USER REPOSITORY - Handles data storage and retrieval
// ============================================================================

class UserRepository {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  emailExists(email) {
    return this.users.some(user => user.email === email);
  }

  usernameExists(username) {
    return this.users.some(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  save(user) {
    const newUser = {
      id: this.nextId++,
      ...user,
      createdAt: new Date().toISOString(),
      isActive: true,
      role: 'user',
      loginAttempts: 0,
      lastLogin: null
    };

    this.users.push(newUser);
    return newUser;
  }

  getAll() {
    return this.users.map(({ password, ...user }) => user);
  }
}

// ============================================================================
// USER SERVICE - Orchestrates validation and registration
// ============================================================================

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  validateUserData(userData) {
    if (!userData) {
      return { valid: false, error: 'No user data provided' };
    }

    // Validate email
    const emailValidation = EmailValidator.validate(userData.email);
    if (!emailValidation.valid) {
      return emailValidation;
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(userData.password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }

    // Validate username
    const usernameValidation = UsernameValidator.validate(userData.username);
    if (!usernameValidation.valid) {
      return usernameValidation;
    }

    // Validate age
    const ageValidation = AgeValidator.validate(userData.age);
    if (!ageValidation.valid) {
      return ageValidation;
    }

    // Validate phone
    const phoneValidation = PhoneValidator.validate(userData.phone);
    if (!phoneValidation.valid) {
      return phoneValidation;
    }

    return { valid: true };
  }

  checkForDuplicates(email, username) {
    if (this.repository.emailExists(email)) {
      return { hasDuplicate: true, error: 'Email already registered' };
    }

    if (this.repository.usernameExists(username)) {
      return { hasDuplicate: true, error: 'Username already taken' };
    }

    return { hasDuplicate: false };
  }

  normalizeUserData(userData) {
    return {
      email: EmailValidator.normalize(userData.email),
      username: UsernameValidator.normalize(userData.username),
      password: userData.password, // In real app, this would be hashed
      age: userData.age || null,
      phone: PhoneValidator.normalize(userData.phone)
    };
  }

  registerUser(userData) {
    // Step 1: Validate input
    const validation = this.validateUserData(userData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Step 2: Normalize data
    const normalizedData = this.normalizeUserData(userData);

    // Step 3: Check for duplicates
    const duplicateCheck = this.checkForDuplicates(
      normalizedData.email,
      normalizedData.username
    );
    if (duplicateCheck.hasDuplicate) {
      return { success: false, error: duplicateCheck.error };
    }

    // Step 4: Save user
    const savedUser = this.repository.save(normalizedData);

    // Step 5: Return success response (excluding password)
    const { password, ...userWithoutPassword } = savedUser;
    return {
      success: true,
      user: userWithoutPassword,
      message: 'User registered successfully'
    };
  }

  getAllUsers() {
    return this.repository.getAll();
  }
}

module.exports = UserService;
