// Modelos de dados para o sistema Plus Capital

class Database {
  constructor() {
    this.admins = [];
    this.representantes = [];
    this.leads = [];
    this.notificacoes = [];
    this.comissoes = [];
    this.nextAdminId = 1;
    this.nextRepresentanteId = 1;
    this.nextLeadId = 1;
    this.nextNotificacaoId = 1;
    this.nextComissaoId = 1;

    // Criar admin padrão
    this.admins.push({
      id: this.nextAdminId++,
      username: 'admin',
      password: 'admin123',
      nome: 'Administrador Plus Capital',
      email: 'admin@pluscapital.com',
      telefone: '(11) 99999-9999',
      linkCodigo: 'admin001',
      status: 'ativo',
      criadoEm: new Date().toISOString()
    });
  }

  // ==================== ADMINS ====================

  criarAdmin(dados) {
    const admin = {
      id: this.nextAdminId++,
      username: dados.username,
      password: dados.password,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      linkCodigo: this.gerarCodigoUnico('admin'),
      status: 'ativo',
      criadoEm: new Date().toISOString()
    };
    this.admins.push(admin);
    return admin;
  }

  buscarAdminPorUsername(username) {
    return this.admins.find(a => a.username === username);
  }

  buscarAdminPorId(id) {
    return this.admins.find(a => a.id === id);
  }

  buscarAdminPorLinkCodigo(codigo) {
    return this.admins.find(a => a.linkCodigo === codigo);
  }

  getAdminComMenosRepresentantes() {
    const contagem = {};
    this.admins.forEach(admin => {
      contagem[admin.id] = this.representantes.filter(
        r => r.adminResponsavelId === admin.id
      ).length;
    });

    let menorId = this.admins[0].id;
    let menorQtd = contagem[menorId];

    for (const adminId in contagem) {
      if (contagem[adminId] < menorQtd) {
        menorQtd = contagem[adminId];
        menorId = parseInt(adminId);
      }
    }

    return this.buscarAdminPorId(menorId);
  }

  // ==================== REPRESENTANTES ====================

  criarRepresentante(dados, adminResponsavelId) {
    const representante = {
      id: this.nextRepresentanteId++,
      nomeCompleto: dados.nomeCompleto,
      cpf: dados.cpf,
      email: dados.email,
      celular: dados.celular,
      endereco: dados.endereco,
      estadoCivil: dados.estadoCivil,
      profissao: dados.profissao,
      experiencias: dados.experiencias,
      motivacao: dados.motivacao,
      aceitouTermos: dados.aceitouTermos,
      dataAceiteTermos: dados.dataAceiteTermos,
      username: null,
      password: null,
      linkCodigo: this.gerarCodigoUnico('rep'),
      qrCode: null,
      adminResponsavelId: adminResponsavelId,
      status: 'em_analise',
      primeiroAcesso: true,
      criadoEm: new Date().toISOString(),
      aprovadoEm: null,
      ultimoAcesso: null
    };
    this.representantes.push(representante);
    return representante;
  }

  aprovarRepresentante(id) {
    const rep = this.buscarRepresentantePorId(id);
    if (!rep) return null;

    rep.status = 'aprovado';
    rep.aprovadoEm = new Date().toISOString();

    // Gerar credenciais
    rep.username = 'rep' + id.toString().padStart(4, '0');
    rep.password = this.gerarSenhaTemporaria();

    return rep;
  }

  buscarRepresentantePorId(id) {
    return this.representantes.find(r => r.id === id);
  }

  buscarRepresentantePorUsername(username) {
    return this.representantes.find(r => r.username === username);
  }

  buscarRepresentantePorCPF(cpf) {
    return this.representantes.find(r => r.cpf === cpf);
  }

  buscarRepresentantePorEmail(email) {
    return this.representantes.find(r => r.email === email);
  }

  buscarRepresentantePorLinkCodigo(codigo) {
    return this.representantes.find(r => r.linkCodigo === codigo);
  }

  listarRepresentantesDoAdmin(adminId) {
    return this.representantes.filter(r => r.adminResponsavelId === adminId);
  }

  atualizarSenhaRepresentante(id, novaSenha) {
    const rep = this.buscarRepresentantePorId(id);
    if (!rep) return false;
    rep.password = novaSenha;
    rep.primeiroAcesso = false;
    return true;
  }

  atualizarDadosRepresentante(id, dados) {
    const rep = this.buscarRepresentantePorId(id);
    if (!rep) return null;

    if (dados.celular) rep.celular = dados.celular;
    if (dados.endereco) rep.endereco = dados.endereco;
    if (dados.profissao) rep.profissao = dados.profissao;

    return rep;
  }

  // ==================== LEADS ====================

  criarLead(dados, representanteId = null, adminId = null) {
    const lead = {
      id: this.nextLeadId++,
      nomeCompleto: dados.nomeCompleto,
      cpf: dados.cpf,
      email: dados.email,
      telefone: dados.telefone,
      renda: dados.renda,
      interesse: dados.interesse,
      observacoes: dados.observacoes || '',
      representanteId: representanteId,
      adminResponsavelId: adminId || (representanteId ? this.buscarRepresentantePorId(representanteId)?.adminResponsavelId : this.getAdminComMenosRepresentantes().id),
      status: 'novo',
      origem: representanteId ? 'representante' : 'site',
      valorFinanciamento: null,
      percentualComissao: null,
      valorComissao: null,
      dataPagamentoComissao: null,
      observacoesInternas: '',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: null,
      historico: []
    };

    this.leads.push(lead);
    return lead;
  }

  buscarLeadPorId(id) {
    return this.leads.find(l => l.id === id);
  }

  listarLeadsDoRepresentante(representanteId) {
    return this.leads.filter(l => l.representanteId === representanteId);
  }

  listarLeadsDoAdmin(adminId) {
    return this.leads.filter(l => l.adminResponsavelId === adminId);
  }

  atualizarStatusLead(leadId, novoStatus, adminId, dados = {}) {
    const lead = this.buscarLeadPorId(leadId);
    if (!lead) return null;

    const statusAnterior = lead.status;
    lead.status = novoStatus;
    lead.atualizadoEm = new Date().toISOString();
    lead.atualizadoPor = adminId;

    // Adicionar ao histórico
    lead.historico.push({
      data: new Date().toISOString(),
      adminId: adminId,
      statusAnterior: statusAnterior,
      statusNovo: novoStatus,
      observacoes: dados.observacoes || ''
    });

    // Se venda finalizada, atualizar comissão
    if (novoStatus === 'aprovado' && dados.valorFinanciamento) {
      lead.valorFinanciamento = dados.valorFinanciamento;
      lead.percentualComissao = dados.percentualComissao;
      lead.valorComissao = dados.valorComissao;
      lead.dataPagamentoComissao = dados.dataPagamentoComissao;

      // Criar registro de comissão se houver representante
      if (lead.representanteId && lead.valorComissao) {
        this.criarComissao({
          leadId: leadId,
          representanteId: lead.representanteId,
          valor: lead.valorComissao,
          percentual: lead.percentualComissao,
          dataPrevistaPagamento: dados.dataPagamentoComissao,
          status: 'pendente'
        });
      }
    }

    if (dados.observacoesInternas) {
      lead.observacoesInternas = dados.observacoesInternas;
    }

    return lead;
  }

  // ==================== COMISSÕES ====================

  criarComissao(dados) {
    const comissao = {
      id: this.nextComissaoId++,
      leadId: dados.leadId,
      representanteId: dados.representanteId,
      valor: dados.valor,
      percentual: dados.percentual,
      dataPrevistaPagamento: dados.dataPrevistaPagamento,
      dataPagamento: null,
      status: dados.status || 'pendente',
      criadoEm: new Date().toISOString()
    };

    this.comissoes.push(comissao);
    return comissao;
  }

  listarComissoesDoRepresentante(representanteId) {
    return this.comissoes.filter(c => c.representanteId === representanteId);
  }

  pagarComissao(comissaoId) {
    const comissao = this.comissoes.find(c => c.id === comissaoId);
    if (!comissao) return null;

    comissao.status = 'pago';
    comissao.dataPagamento = new Date().toISOString();

    return comissao;
  }

  getEstatisticasRepresentante(representanteId) {
    const leads = this.listarLeadsDoRepresentante(representanteId);
    const comissoes = this.listarComissoesDoRepresentante(representanteId);

    const totalComissaoPendente = comissoes
      .filter(c => c.status === 'pendente')
      .reduce((acc, c) => acc + parseFloat(c.valor), 0);

    const totalComissaoPaga = comissoes
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + parseFloat(c.valor), 0);

    const vendasFechadas = leads.filter(l => l.status === 'aprovado').length;
    const leadsEmAndamento = leads.filter(l =>
      ['novo', 'em_analise', 'em_negociacao'].includes(l.status)
    ).length;

    return {
      totalLeads: leads.length,
      vendasFechadas,
      leadsEmAndamento,
      totalComissaoPendente,
      totalComissaoPaga,
      comissoes
    };
  }

  // ==================== NOTIFICAÇÕES ====================

  criarNotificacao(dados) {
    const notificacao = {
      id: this.nextNotificacaoId++,
      titulo: dados.titulo,
      texto: dados.texto,
      tipo: dados.tipo || 'geral',
      tags: dados.tags || [],
      destinatarios: dados.destinatarios || 'todos',
      lidas: [],
      criadoEm: new Date().toISOString(),
      criadoPor: dados.criadoPor
    };

    this.notificacoes.push(notificacao);
    return notificacao;
  }

  listarNotificacoesParaRepresentante(representanteId) {
    return this.notificacoes
      .filter(n => n.destinatarios === 'todos' || n.destinatarios.includes(representanteId))
      .map(n => ({
        ...n,
        lida: n.lidas.includes(representanteId)
      }))
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  }

  marcarNotificacaoComoLida(notificacaoId, representanteId) {
    const notificacao = this.notificacoes.find(n => n.id === notificacaoId);
    if (!notificacao) return false;

    if (!notificacao.lidas.includes(representanteId)) {
      notificacao.lidas.push(representanteId);
    }

    return true;
  }

  // ==================== UTILITÁRIOS ====================

  gerarCodigoUnico(prefixo) {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = prefixo + '_';
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  gerarSenhaTemporaria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let senha = 'Plus';
    for (let i = 0; i < 6; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  }
}

module.exports = Database;
