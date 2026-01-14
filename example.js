// Exemplo prático de uso do UserService refatorado

const UserService = require('./userService.refactored');

console.log('=== Exemplo de Uso do UserService Refatorado ===\n');

// Criar instância do serviço
const userService = new UserService();

console.log('1️⃣  Tentando registrar usuário com dados inválidos...\n');

// Exemplo 1: Email inválido
const result1 = userService.registerUser({
  email: 'email-invalido',
  username: 'joao123',
  password: 'Senha123!@#'
});
console.log('❌ Email inválido:', result1);
console.log('');

// Exemplo 2: Senha fraca
const result2 = userService.registerUser({
  email: 'joao@example.com',
  username: 'joao123',
  password: 'senha123'  // Falta maiúscula e caractere especial
});
console.log('❌ Senha fraca:', result2);
console.log('');

console.log('2️⃣  Registrando usuários válidos...\n');

// Exemplo 3: Registro bem-sucedido
const result3 = userService.registerUser({
  email: 'joao@example.com',
  username: 'joao123',
  password: 'Senha123!@#',
  age: 25,
  phone: '(11) 98765-4321'
});
console.log('✅ Usuário registrado:', result3);
console.log('');

// Exemplo 4: Outro usuário válido
const result4 = userService.registerUser({
  email: 'maria@example.com',
  username: 'maria_silva',
  password: 'MariaPass456!',
  age: 30
});
console.log('✅ Usuário registrado:', result4);
console.log('');

console.log('3️⃣  Tentando registrar email duplicado...\n');

// Exemplo 5: Email já existe
const result5 = userService.registerUser({
  email: 'joao@example.com',  // Email já usado
  username: 'joao456',
  password: 'OutraSenha123!'
});
console.log('❌ Email duplicado:', result5);
console.log('');

console.log('4️⃣  Listando todos os usuários...\n');

// Listar todos os usuários
const allUsers = userService.getAllUsers();
console.log('📋 Usuários registrados:', JSON.stringify(allUsers, null, 2));
console.log('');

console.log('=== Fim do Exemplo ===');
