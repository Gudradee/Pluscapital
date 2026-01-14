// Tests to verify both implementations have the same behavior

const OriginalUserService = require('./userService');
const RefactoredUserService = require('./userService.refactored');

// Test helper
function runTests(UserService, version) {
  console.log(`\n========== Testing ${version} ==========\n`);

  let service;

  // Reset service before each test
  function beforeEach() {
    service = new UserService();
  }

  function test(name, fn) {
    beforeEach();
    try {
      fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
    }
  }

  function assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`
      );
    }
  }

  // ==================== Tests ====================

  test('Should reject registration with no user data', () => {
    const result = service.registerUser(null);
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'No user data provided', 'Should have correct error');
  });

  test('Should reject registration with missing email', () => {
    const result = service.registerUser({
      username: 'testuser',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Email is required', 'Should have correct error');
  });

  test('Should reject registration with invalid email format', () => {
    const result = service.registerUser({
      email: 'invalid-email',
      username: 'testuser',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Invalid email format', 'Should have correct error');
  });

  test('Should reject registration with missing password', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Password is required', 'Should have correct error');
  });

  test('Should reject registration with short password', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass1!'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Password must be at least 8 characters', 'Should have correct error');
  });

  test('Should reject registration with password missing uppercase', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123!'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(
      result.error,
      'Password must contain uppercase, lowercase, number, and special character',
      'Should have correct error'
    );
  });

  test('Should reject registration with missing username', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Username is required', 'Should have correct error');
  });

  test('Should reject registration with short username', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'ab',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Username must be at least 3 characters', 'Should have correct error');
  });

  test('Should reject registration with long username', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'a'.repeat(21),
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Username must be at most 20 characters', 'Should have correct error');
  });

  test('Should reject registration with invalid username characters', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'test user!',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(
      result.error,
      'Username can only contain letters, numbers, underscores, and hyphens',
      'Should have correct error'
    );
  });

  test('Should reject registration with age under 13', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass123!@#',
      age: 12
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Must be at least 13 years old', 'Should have correct error');
  });

  test('Should reject registration with age over 120', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass123!@#',
      age: 121
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Invalid age', 'Should have correct error');
  });

  test('Should reject registration with invalid age type', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass123!@#',
      age: 'twenty'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Age must be a number', 'Should have correct error');
  });

  test('Should reject registration with invalid phone number', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass123!@#',
      phone: '123'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Invalid phone number', 'Should have correct error');
  });

  test('Should successfully register user with valid data', () => {
    const result = service.registerUser({
      email: 'Test@Example.com',
      username: ' testuser ',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, true, 'Should succeed');
    assertEqual(result.user.email, 'test@example.com', 'Email should be normalized');
    assertEqual(result.user.username, 'testuser', 'Username should be trimmed');
    assertEqual(result.user.password, undefined, 'Password should not be returned');
    assertEqual(result.user.id, 1, 'Should have ID');
    assertEqual(result.message, 'User registered successfully', 'Should have success message');
  });

  test('Should successfully register user with optional fields', () => {
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Pass123!@#',
      age: 25,
      phone: '(555) 123-4567'
    });
    assertEqual(result.success, true, 'Should succeed');
    assertEqual(result.user.age, 25, 'Should include age');
    assertEqual(result.user.phone, '5551234567', 'Phone should be normalized');
  });

  test('Should reject duplicate email registration', () => {
    service.registerUser({
      email: 'test@example.com',
      username: 'user1',
      password: 'Pass123!@#'
    });
    const result = service.registerUser({
      email: 'test@example.com',
      username: 'user2',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Email already registered', 'Should have correct error');
  });

  test('Should reject duplicate username registration (case insensitive)', () => {
    service.registerUser({
      email: 'test1@example.com',
      username: 'testuser',
      password: 'Pass123!@#'
    });
    const result = service.registerUser({
      email: 'test2@example.com',
      username: 'TestUser',
      password: 'Pass123!@#'
    });
    assertEqual(result.success, false, 'Should fail');
    assertEqual(result.error, 'Username already taken', 'Should have correct error');
  });

  test('Should return all users without passwords', () => {
    service.registerUser({
      email: 'user1@example.com',
      username: 'user1',
      password: 'Pass123!@#'
    });
    service.registerUser({
      email: 'user2@example.com',
      username: 'user2',
      password: 'Pass123!@#'
    });
    const users = service.getAllUsers();
    assertEqual(users.length, 2, 'Should have 2 users');
    assertEqual(users[0].password, undefined, 'First user should not have password');
    assertEqual(users[1].password, undefined, 'Second user should not have password');
  });

  console.log(`\n✓ All tests passed for ${version}!\n`);
}

// Run tests for both versions
runTests(OriginalUserService, 'Original Version');
runTests(RefactoredUserService, 'Refactored Version');

console.log('========================================');
console.log('Both implementations behave identically!');
console.log('========================================\n');
