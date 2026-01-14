const express = require('express');
const session = require('express-session');
const UserService = require('./userService.refactored');

const app = express();
const PORT = 3000;

// Criar instância do serviço
const userService = new UserService();

// Base de dados de usuários do sistema (admin e representantes)
const systemUsers = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador Plus Capital'
  },
  representante: {
    username: 'representante',
    password: 'rep123',
    role: 'representative',
    name: 'Representante Plus Capital'
  }
};

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sessões
app.use(session({
  secret: 'pluscapital-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // mudar para true em produção com HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================================

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
}

function requireRepresentative(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'representative') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas representantes.' });
  }
}

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

// GET /login - Página de login
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    // Já está logado, redirecionar para dashboard apropriado
    if (req.session.user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/representante');
    }
  } else {
    res.sendFile(__dirname + '/public/login.html');
  }
});

// POST /api/auth/login - Processar login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Tentativa de login:', username);

  // Verificar credenciais
  const user = systemUsers[username];

  if (user && user.password === password) {
    // Login bem-sucedido
    req.session.user = {
      username: user.username,
      role: user.role,
      name: user.name
    };

    console.log('✅ Login bem-sucedido:', user.name);

    res.json({
      success: true,
      message: 'Login bem-sucedido!',
      user: {
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } else {
    console.log('❌ Login falhou para:', username);
    res.status(401).json({
      success: false,
      error: 'Usuário ou senha incorretos'
    });
  }
});

// POST /api/auth/logout - Fazer logout
app.post('/api/auth/logout', (req, res) => {
  const username = req.session.user ? req.session.user.username : 'Desconhecido';
  req.session.destroy((err) => {
    if (err) {
      console.log('❌ Erro ao fazer logout:', err);
      res.status(500).json({ success: false, error: 'Erro ao fazer logout' });
    } else {
      console.log('👋 Logout realizado:', username);
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    }
  });
});

// GET /api/auth/me - Obter usuário atual
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }
});

// ============================================================================
// ROTAS PROTEGIDAS - DASHBOARDS
// ============================================================================

// GET /admin - Dashboard do administrador
app.get('/admin', requireAuth, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/representante');
  }
  res.sendFile(__dirname + '/public/admin.html');
});

// GET /representante - Dashboard do representante
app.get('/representante', requireAuth, (req, res) => {
  if (req.session.user.role !== 'representative') {
    return res.redirect('/admin');
  }
  res.sendFile(__dirname + '/public/representante.html');
});

// ============================================================================
// API ENDPOINTS - USERS (Original)
// ============================================================================

// GET / - Redirecionar para login
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/representante');
    }
  } else {
    res.redirect('/login');
  }
});

// POST /api/users - Registrar novo usuário (requer autenticação)
app.post('/api/users', requireAuth, (req, res) => {
  console.log('📥 Recebendo requisição de:', req.session.user.username);

  const result = userService.registerUser(req.body);

  if (result.success) {
    console.log('✅ Usuário registrado:', result.user);
    res.status(201).json(result);
  } else {
    console.log('❌ Erro no registro:', result.error);
    res.status(400).json(result);
  }
});

// GET /api/users - Listar todos os usuários (requer autenticação)
app.get('/api/users', requireAuth, (req, res) => {
  const users = userService.getAllUsers();
  console.log(`📋 ${req.session.user.username} listando ${users.length} usuários`);
  res.json({
    success: true,
    count: users.length,
    users: users
  });
});

// DELETE /api/users - Limpar todos os usuários (apenas admin)
app.delete('/api/users', requireAuth, requireAdmin, (req, res) => {
  userService.repository.users = [];
  userService.repository.nextId = 1;
  console.log('🗑️  Todos os usuários foram removidos por:', req.session.user.username);
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
  console.log('🚀  Plus Capital - Sistema Rodando!');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📍 URL Principal: http://localhost:${PORT}`);
  console.log('');
  console.log('🔐 CREDENCIAIS DE ACESSO:');
  console.log('');
  console.log('   👤 ADMINISTRADOR:');
  console.log('      URL: http://localhost:${PORT}/login');
  console.log('      Usuário: admin');
  console.log('      Senha: admin123');
  console.log('');
  console.log('   👤 REPRESENTANTE:');
  console.log('      URL: http://localhost:${PORT}/login');
  console.log('      Usuário: representante');
  console.log('      Senha: rep123');
  console.log('');
  console.log('📚 Endpoints da API:');
  console.log(`   POST   /api/auth/login     - Fazer login`);
  console.log(`   POST   /api/auth/logout    - Fazer logout`);
  console.log(`   GET    /api/auth/me        - Usuário atual`);
  console.log(`   POST   /api/users          - Registrar usuário`);
  console.log(`   GET    /api/users          - Listar usuários`);
  console.log(`   DELETE /api/users          - Limpar usuários (admin)`);
  console.log('');
  console.log('💡 Acesse: http://localhost:3000');
  console.log('');
  console.log('⌨️  Pressione Ctrl+C para parar o servidor');
  console.log('========================================');
  console.log('');
});
