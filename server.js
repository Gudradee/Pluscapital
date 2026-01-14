const express = require('express');
const UserService = require('./userService.refactored');

const app = express();
const PORT = 3000;

// Criar instância do serviço
const userService = new UserService();

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// ============================================================================
// API ENDPOINTS
// ============================================================================

// GET / - Página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST /api/users - Registrar novo usuário
app.post('/api/users', (req, res) => {
  console.log('📥 Recebendo requisição:', req.body);

  const result = userService.registerUser(req.body);

  if (result.success) {
    console.log('✅ Usuário registrado:', result.user);
    res.status(201).json(result);
  } else {
    console.log('❌ Erro no registro:', result.error);
    res.status(400).json(result);
  }
});

// GET /api/users - Listar todos os usuários
app.get('/api/users', (req, res) => {
  const users = userService.getAllUsers();
  console.log(`📋 Listando ${users.length} usuários`);
  res.json({
    success: true,
    count: users.length,
    users: users
  });
});

// DELETE /api/users - Limpar todos os usuários (para testes)
app.delete('/api/users', (req, res) => {
  userService.repository.users = [];
  userService.repository.nextId = 1;
  console.log('🗑️  Todos os usuários foram removidos');
  res.json({
    success: true,
    message: 'All users cleared'
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀  Servidor rodando com sucesso!');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📚 Endpoints disponíveis:');
  console.log(`   GET    http://localhost:${PORT}/            - Interface Web`);
  console.log(`   POST   http://localhost:${PORT}/api/users   - Registrar usuário`);
  console.log(`   GET    http://localhost:${PORT}/api/users   - Listar usuários`);
  console.log(`   DELETE http://localhost:${PORT}/api/users   - Limpar usuários`);
  console.log('');
  console.log('💡 Abra seu navegador e acesse: http://localhost:3000');
  console.log('');
  console.log('⌨️  Pressione Ctrl+C para parar o servidor');
  console.log('========================================');
  console.log('');
});
