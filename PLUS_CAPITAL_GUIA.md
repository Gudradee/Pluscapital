# PLUS CAPITAL - SISTEMA DE GESTÃO DE REPRESENTANTES E LEADS

## VISÃO GERAL

Sistema profissional de gestão comercial para captura de leads através de representantes com controle de comissões.

## DESIGN

- **Paleta de Cores**: Laranja (#FF6B35), Preto (#1A1A1A), Branco (#FFFFFF)
- **Estilo**: Minimalista e profissional, sem emojis
- **Responsive**: Funciona em desktop e mobile

## COMO INICIAR

```bash
npm run start:pluscapital
```

Acesse: **http://localhost:3000**

## CREDENCIAIS PADRÃO

**Admin:**
- Usuário: `admin`
- Senha: `admin123`

## FLUXO COMPLETO DO SISTEMA

### 1. ADMINISTRADOR (VENDEDOR)

#### Login
1. Acesse http://localhost:3000
2. Faça login com admin/admin123
3. Dashboard: Informações, Visão Geral, Financeiro, FAQ

#### Cadastrar Representantes
1. Na página "Informações", copie seu link de cadastro
2. Exemplo: `http://localhost:3000/cadastro/admin_abc123`
3. Compartilhe com candidatos a representante

#### Aprovar Representantes
1. Acesse "Visão Geral"
2. Veja representantes com status "em análise"
3. Clique em "Aprovar"
4. Sistema gera username/senha automaticamente
5. Envie as credenciais para o representante

#### Gerenciar Leads
1. Acesse "Financeiro"
2. Veja todos os leads captados
3. Clique em um lead para abrir detalhes
4. Atualize:
   - Status (novo, em análise, em negociação, aprovado, reprovado, não seguiu)
   - Valor do financiamento
   - Percentual de comissão
   - Observações internas
5. Ao marcar como "aprovado" com valor e %, o sistema calcula comissão automaticamente

### 2. REPRESENTANTE

#### Primeiro Acesso
1. Recebe username/senha do admin
2. Faz login em http://localhost:3000
3. Sistema força troca de senha
4. Define nova senha (mínimo 6 caracteres)

#### Gerar Link de Captura
1. Acesse "Informações"
2. Veja seu link personalizado
3. Clique em "Copiar Link"
4. Clique em "Gerar QR Code" para baixar

#### Divulgar
1. Compartilhe seu link em:
   - WhatsApp
   - Instagram
   - Facebook
   - Email
   - Cartão de visita (QR Code)

#### Acompanhar Leads
1. Acesse "Financeiro"
2. Veja cards com estatísticas:
   - Total de Leads
   - Vendas Fechadas
   - Comissão Pendente
   - Comissão Paga
3. Lista de leads com detalhes

#### Notificações
1. Acesse "Notificações"
2. Veja comunicados do admin
3. Atualizações sobre leads

### 3. CLIENTE (LEAD)

1. Cliente recebe link do representante
2. Exemplo: `http://localhost:3000/lead/rep_xyz789`
3. Preenche formulário:
   - Nome completo
   - CPF
   - Email
   - Telefone
   - Renda
   - Interesse (imóvel ou veículo)
   - Observações
4. Envia
5. Lead fica vinculado ao representante automaticamente

## ESTRUTURA DE STATUS

### Status de Representante:
- **em_analise**: Aguardando aprovação do admin
- **aprovado**: Admin aprovou mas ainda não está ativo
- **ativo**: Pode gerar links e captar leads

### Status de Lead:
- **novo**: Lead acabou de chegar
- **em_analise**: Admin está analisando
- **em_negociacao**: Admin está negociando com o cliente
- **aprovado**: Venda fechada
- **reprovado**: Cliente não aprovado
- **nao_seguiu**: Cliente não deu seguimento

### Status de Comissão:
- **pendente**: Aguardando pagamento
- **pago**: Comissão paga ao representante

## FUNCIONALIDADES PRINCIPAIS

### Admin:
- Gerar link de cadastro de representantes
- Aprovar/rejeitar representantes
- Visualizar todos os representantes e suas estatísticas
- Gerenciar todos os leads
- Atualizar status de leads
- Registrar vendas e comissões
- Enviar notificações (futuro)
- Dashboard com estatísticas consolidadas

### Representante:
- Gerar link/QR Code personalizado
- Visualizar seus leads em tempo real
- Acompanhar status de cada lead
- Ver comissões pendentes e pagas
- Receber notificações
- Atualizar dados cadastrais
- FAQ com contatos importantes

## DIFERENCIAIS

1. **Links Únicos**: Cada admin e representante tem código único
2. **Rastreamento**: Sistema identifica origem de cada lead
3. **Comissões Automáticas**: Cálculo automático ao aprovar venda
4. **Histórico**: Todas alterações são registradas
5. **Distribuição Inteligente**: Leads sem representante vão para admin com menos leads
6. **Profissional**: Design clean, sem emojis, cores corporativas

## SEGURANÇA

- Autenticação com sessões
- Rotas protegidas por middleware
- Senhas em texto (para demo - em produção usar bcrypt)
- Validação de CPF e email únicos
- Primeiro acesso obriga troca de senha

## TECNOLOGIAS

- Node.js + Express
- Express-session para autenticação
- Banco de dados em memória (facilmente substituível por MongoDB/PostgreSQL)
- Frontend vanilla JavaScript
- CSS minimalista

## EXPANSÕES FUTURAS

- Sistema de notificações push
- Upload de documentos
- Chat entre admin e representante
- Relatórios em PDF
- Dashboard com gráficos
- Integração com WhatsApp
- Sistema de metas e bonificações
- App mobile

## CONTATOS DE SUPORTE (CONFIGURÁVEIS NO FAQ)

- Tesouraria: (11) 9999-9999
- Suporte: suporte@pluscapital.com
- Admin: admin@pluscapital.com

## OBSERVAÇÕES

- Sistema roda em memória - dados são perdidos ao reiniciar
- Para produção, integrar com banco de dados real
- Todas as funcionalidades especificadas foram implementadas
- Design segue rigorosamente as cores Plus Capital
- Interface totalmente profissional e minimalista
