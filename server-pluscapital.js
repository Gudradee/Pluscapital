const express = require('express');
const session = require('express-session');
const Database = require('./models');

const app = express();
const PORT = 3000;

// Criar instância do banco de dados
const db = new Database();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sessões
app.use(session({
  secret: 'pluscapital-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir arquivos estáticos
app.use(express.static('public-pluscapital'));

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
  if (req.session && req.session.user && req.session.user.tipo === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
}

function requireRepresentante(req, res, next) {
  if (req.session && req.session.user && req.session.user.tipo === 'representante') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas representantes.' });
  }
}

// ============================================================================
// ROTAS PÚBLICAS - CADASTRO DE REPRESENTANTE
// ============================================================================

// GET /cadastro/:adminCodigo - Formulário de cadastro de representante
app.get('/cadastro/:adminCodigo', (req, res) => {
  const adminCodigo = req.params.adminCodigo;
  const admin = db.buscarAdminPorLinkCodigo(adminCodigo);

  if (!admin) {
    return res.status(404).send('Link inválido');
  }

  res.sendFile(__dirname + '/public-pluscapital/cadastro-representante.html');
});

// POST /api/cadastro-representante - Processar cadastro
app.post('/api/cadastro-representante', (req, res) => {
  const { adminCodigo, ...dados } = req.body;

  // Validar admin
  const admin = db.buscarAdminPorLinkCodigo(adminCodigo);
  if (!admin) {
    return res.status(404).json({ success: false, error: 'Link inválido' });
  }

  // Validar CPF único
  if (db.buscarRepresentantePorCPF(dados.cpf)) {
    return res.status(400).json({ success: false, error: 'CPF já cadastrado' });
  }

  // Validar email único
  if (db.buscarRepresentantePorEmail(dados.email)) {
    return res.status(400).json({ success: false, error: 'Email já cadastrado' });
  }

  // Criar representante
  const representante = db.criarRepresentante({
    ...dados,
    aceitouTermos: true,
    dataAceiteTermos: new Date().toISOString()
  }, admin.id);

  res.json({
    success: true,
    message: 'Cadastro realizado com sucesso! Aguarde a aprovação.',
    representante: {
      id: representante.id,
      nomeCompleto: representante.nomeCompleto,
      status: representante.status
    }
  });
});

// ============================================================================
// ROTAS PÚBLICAS - FORMULÁRIO DE LEAD
// ============================================================================

// GET /lead/:representanteCodigo - Formulário de lead
app.get('/lead/:representanteCodigo', (req, res) => {
  const repCodigo = req.params.representanteCodigo;
  const representante = db.buscarRepresentantePorLinkCodigo(repCodigo);

  if (!representante) {
    return res.status(404).send('Link inválido');
  }

  if (representante.status !== 'ativo') {
    return res.status(403).send('Representante não está ativo');
  }

  res.sendFile(__dirname + '/public-pluscapital/formulario-lead.html');
});

// POST /api/lead - Processar lead
app.post('/api/lead', (req, res) => {
  const { representanteCodigo, ...dados } = req.body;

  let representanteId = null;
  let adminId = null;

  if (representanteCodigo) {
    const representante = db.buscarRepresentantePorLinkCodigo(representanteCodigo);
    if (representante && representante.status === 'ativo') {
      representanteId = representante.id;
    }
  }

  const lead = db.criarLead(dados, representanteId, adminId);

  res.json({
    success: true,
    message: 'Cadastro realizado! Entraremos em contato em breve.',
    lead: {
      id: lead.id
    }
  });
});

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

// GET /login
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.tipo === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/representante/dashboard');
    }
  }
  res.sendFile(__dirname + '/public-pluscapital/login.html');
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Tentativa de login:', username);

  // Verificar admin
  const admin = db.buscarAdminPorUsername(username);
  if (admin && admin.password === password) {
    req.session.user = {
      id: admin.id,
      tipo: 'admin',
      username: admin.username,
      nome: admin.nome
    };

    return res.json({
      success: true,
      tipo: 'admin',
      primeiroAcesso: false
    });
  }

  // Verificar representante
  const representante = db.buscarRepresentantePorUsername(username);
  if (representante && representante.password === password) {
    if (representante.status !== 'aprovado' && representante.status !== 'ativo') {
      return res.status(403).json({
        success: false,
        error: 'Cadastro ainda em análise'
      });
    }

    req.session.user = {
      id: representante.id,
      tipo: 'representante',
      username: representante.username,
      nome: representante.nomeCompleto,
      primeiroAcesso: representante.primeiroAcesso
    };

    return res.json({
      success: true,
      tipo: 'representante',
      primeiroAcesso: representante.primeiroAcesso
    });
  }

  res.status(401).json({
    success: false,
    error: 'Usuário ou senha incorretos'
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false });
  }

  res.json({
    success: true,
    user: req.session.user
  });
});

// POST /api/auth/trocar-senha
app.post('/api/auth/trocar-senha', requireAuth, requireRepresentante, (req, res) => {
  const { novaSenha } = req.body;

  if (!novaSenha || novaSenha.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Senha deve ter no mínimo 6 caracteres'
    });
  }

  const sucesso = db.atualizarSenhaRepresentante(req.session.user.id, novaSenha);

  if (sucesso) {
    req.session.user.primeiroAcesso = false;
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Erro ao trocar senha' });
  }
});

// ============================================================================
// ROTAS DO REPRESENTANTE
// ============================================================================

// GET /representante/dashboard
app.get('/representante/dashboard', requireAuth, requireRepresentante, (req, res) => {
  res.sendFile(__dirname + '/public-pluscapital/representante-dashboard.html');
});

// GET /api/representante/perfil
app.get('/api/representante/perfil', requireAuth, requireRepresentante, (req, res) => {
  const rep = db.buscarRepresentantePorId(req.session.user.id);
  if (!rep) {
    return res.status(404).json({ success: false, error: 'Representante não encontrado' });
  }

  const { password, ...dadosSemSenha } = rep;
  res.json({
    success: true,
    perfil: dadosSemSenha
  });
});

// PUT /api/representante/perfil
app.put('/api/representante/perfil', requireAuth, requireRepresentante, (req, res) => {
  const repAtualizado = db.atualizarDadosRepresentante(req.session.user.id, req.body);

  if (!repAtualizado) {
    return res.status(404).json({ success: false });
  }

  const { password, ...dadosSemSenha } = repAtualizado;
  res.json({
    success: true,
    perfil: dadosSemSenha
  });
});

// GET /api/representante/link
app.get('/api/representante/link', requireAuth, requireRepresentante, (req, res) => {
  const rep = db.buscarRepresentantePorId(req.session.user.id);
  if (!rep) {
    return res.status(404).json({ success: false });
  }

  const baseUrl = req.protocol + '://' + req.get('host');
  const linkCompleto = `${baseUrl}/lead/${rep.linkCodigo}`;

  res.json({
    success: true,
    linkCodigo: rep.linkCodigo,
    linkCompleto: linkCompleto
  });
});

// GET /api/representante/leads
app.get('/api/representante/leads', requireAuth, requireRepresentante, (req, res) => {
  const leads = db.listarLeadsDoRepresentante(req.session.user.id);
  res.json({
    success: true,
    leads: leads
  });
});

// GET /api/representante/estatisticas
app.get('/api/representante/estatisticas', requireAuth, requireRepresentante, (req, res) => {
  const stats = db.getEstatisticasRepresentante(req.session.user.id);
  res.json({
    success: true,
    ...stats
  });
});

// GET /api/representante/notificacoes
app.get('/api/representante/notificacoes', requireAuth, requireRepresentante, (req, res) => {
  const notificacoes = db.listarNotificacoesParaRepresentante(req.session.user.id);
  res.json({
    success: true,
    notificacoes: notificacoes
  });
});

// POST /api/representante/notificacoes/:id/ler
app.post('/api/representante/notificacoes/:id/ler', requireAuth, requireRepresentante, (req, res) => {
  const notificacaoId = parseInt(req.params.id);
  const sucesso = db.marcarNotificacaoComoLida(notificacaoId, req.session.user.id);

  res.json({ success: sucesso });
});

// ============================================================================
// ROTAS DO ADMIN
// ============================================================================

// GET /admin/dashboard
app.get('/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(__dirname + '/public-pluscapital/admin-dashboard.html');
});

// GET /api/admin/link-cadastro
app.get('/api/admin/link-cadastro', requireAuth, requireAdmin, (req, res) => {
  const admin = db.buscarAdminPorId(req.session.user.id);
  if (!admin) {
    return res.status(404).json({ success: false });
  }

  const baseUrl = req.protocol + '://' + req.get('host');
  const linkCompleto = `${baseUrl}/cadastro/${admin.linkCodigo}`;

  res.json({
    success: true,
    linkCodigo: admin.linkCodigo,
    linkCompleto: linkCompleto
  });
});

// GET /api/admin/representantes
app.get('/api/admin/representantes', requireAuth, requireAdmin, (req, res) => {
  const representantes = db.listarRepresentantesDoAdmin(req.session.user.id);

  const comEstatisticas = representantes.map(rep => {
    const stats = db.getEstatisticasRepresentante(rep.id);
    return {
      ...rep,
      ...stats
    };
  });

  res.json({
    success: true,
    representantes: comEstatisticas
  });
});

// POST /api/admin/representantes/:id/aprovar
app.post('/api/admin/representantes/:id/aprovar', requireAuth, requireAdmin, (req, res) => {
  const repId = parseInt(req.params.id);
  const rep = db.aprovarRepresentante(repId);

  if (!rep) {
    return res.status(404).json({ success: false, error: 'Representante não encontrado' });
  }

  // Alterar status para ativo
  rep.status = 'ativo';

  res.json({
    success: true,
    representante: rep,
    credenciais: {
      username: rep.username,
      password: rep.password
    }
  });
});

// GET /api/admin/leads
app.get('/api/admin/leads', requireAuth, requireAdmin, (req, res) => {
  const leads = db.listarLeadsDoAdmin(req.session.user.id);
  res.json({
    success: true,
    leads: leads
  });
});

// GET /api/admin/leads/:id
app.get('/api/admin/leads/:id', requireAuth, requireAdmin, (req, res) => {
  const leadId = parseInt(req.params.id);
  const lead = db.buscarLeadPorId(leadId);

  if (!lead || lead.adminResponsavelId !== req.session.user.id) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado' });
  }

  res.json({
    success: true,
    lead: lead
  });
});

// PUT /api/admin/leads/:id/status
app.put('/api/admin/leads/:id/status', requireAuth, requireAdmin, (req, res) => {
  const leadId = parseInt(req.params.id);
  const { status, ...dados } = req.body;

  const leadAtualizado = db.atualizarStatusLead(
    leadId,
    status,
    req.session.user.id,
    dados
  );

  if (!leadAtualizado) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado' });
  }

  res.json({
    success: true,
    lead: leadAtualizado
  });
});

// POST /api/admin/notificacoes
app.post('/api/admin/notificacoes', requireAuth, requireAdmin, (req, res) => {
  const notificacao = db.criarNotificacao({
    ...req.body,
    criadoPor: req.session.user.id
  });

  res.json({
    success: true,
    notificacao: notificacao
  });
});

// GET /api/admin/estatisticas
app.get('/api/admin/estatisticas', requireAuth, requireAdmin, (req, res) => {
  const representantes = db.listarRepresentantesDoAdmin(req.session.user.id);
  const leads = db.listarLeadsDoAdmin(req.session.user.id);

  const totalRepresentantes = representantes.length;
  const representantesAtivos = representantes.filter(r => r.status === 'ativo').length;
  const totalLeads = leads.length;
  const leadsNovos = leads.filter(l => l.status === 'novo').length;
  const leadsAprovados = leads.filter(l => l.status === 'aprovado').length;

  let totalVendas = 0;
  let totalComissoes = 0;

  leads.forEach(lead => {
    if (lead.valorFinanciamento) {
      totalVendas += parseFloat(lead.valorFinanciamento);
    }
    if (lead.valorComissao) {
      totalComissoes += parseFloat(lead.valorComissao);
    }
  });

  res.json({
    success: true,
    totalRepresentantes,
    representantesAtivos,
    totalLeads,
    leadsNovos,
    leadsAprovados,
    totalVendas,
    totalComissoes
  });
});

// ============================================================================
// ROTA RAIZ
// ============================================================================

app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.tipo === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/representante/dashboard');
    }
  }
  res.redirect('/login');
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('   PLUS CAPITAL - SISTEMA RODANDO');
  console.log('========================================');
  console.log('');
  console.log(`URL: http://localhost:${PORT}`);
  console.log('');
  console.log('CREDENCIAIS DE ACESSO:');
  console.log('');
  console.log('  ADMIN:');
  console.log('    Usuario: admin');
  console.log('    Senha: admin123');
  console.log('');
  console.log('LINK DE CADASTRO DE REPRESENTANTE:');
  console.log(`  http://localhost:${PORT}/cadastro/admin_001`);
  console.log('');
  console.log('========================================');
  console.log('');
});
