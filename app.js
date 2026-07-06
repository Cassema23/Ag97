// ===== DADOS GLOBAIS =====
let usuarioAutenticado = null;
let escuteiros = [];
let dirigentes = [];
let cadastros = [];
let pagamentos = [];
let edicaoAtual = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
  document.querySelectorAll('.menu button').forEach(btn => {
    btn.addEventListener('click', (e) => mudarPagina(e.target.closest('button').dataset.page));
  });
  document.querySelectorAll('.atalho-card').forEach(card => {
    card.addEventListener('click', () => mudarPagina(card.dataset.page));
  });
  atualizarData();
  setInterval(atualizarData, 60000);
});

// ===== AUTENTICAÇÃO =====
function fazerLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('login-usuario').value;
  const senha = document.getElementById('login-senha').value;
  
  if (usuario === 'admin' && senha === '123456') {
    usuarioAutenticado = usuario;
    localStorage.setItem('usuario_ag97', usuario);
    mostrarTelaApp();
  } else {
    mostrarAlerta('login', 'Utilizador ou senha incorretos', 'erro');
  }
}

function fazerLogout() {
  usuarioAutenticado = null;
  localStorage.removeItem('usuario_ag97');
  document.getElementById('tela-login').style.display = 'flex';
  document.getElementById('main-container').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('login-usuario').value = '';
  document.getElementById('login-senha').value = '';
}

function verificarAutenticacao() {
  usuarioAutenticado = localStorage.getItem('usuario_ag97');
  if (usuarioAutenticado) {
    mostrarTelaApp();
  }
}

function mostrarTelaApp() {
  document.getElementById('tela-login').style.display = 'none';
  document.getElementById('main-container').style.display = 'block';
  document.getElementById('sidebar').style.display = 'flex';
  carregarDados();
  renderizar();
}

// ===== NAVEGAÇÃO =====
function mudarPagina(pagina) {
  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
  
  const paginaDiv = document.getElementById(`page-${pagina}`);
  if (paginaDiv) {
    paginaDiv.classList.add('active');
    const menuBtn = document.querySelector(`[data-page="${pagina}"]`);
    if (menuBtn) menuBtn.classList.add('active');
    
    const titulos = {
      home: 'Início',
      escuteiros: 'Escuteiros',
      dirigentes: 'Dirigentes',
      secoes: 'Secções',
      secretaria: 'Secretaria',
      tesouraria: 'Tesouraria',
      relatorios: 'Relatórios'
    };
    document.getElementById('tituloPagina').textContent = titulos[pagina] || 'Sistema';
    
    if (pagina === 'secoes') renderSecoes();
    if (pagina === 'tesouraria' || pagina === 'relatorios') atualizarResumoFinanceiro();
    if (pagina === 'relatorios') renderRelatorios();
  }
  
  if (window.innerWidth <= 920) toggleSidebar();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('aberta');
}

// ===== FORMULÁRIOS =====
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.classList.toggle('aberto');
  if (form.classList.contains('aberto')) {
    form.reset();
  }
}

// ===== ESCUTEIROS =====
function adicionarEscuteiro(event) {
  event.preventDefault();
  const escuteiro = {
    id: Date.now(),
    nome: document.getElementById('esc-nome').value,
    nascimento: document.getElementById('esc-nasc').value,
    encarregado: document.getElementById('esc-enc').value,
    contacto: document.getElementById('esc-contacto').value,
    secao: 'Exploradores Júniores',
    estado: 'Ativo'
  };
  escuteiros.push(escuteiro);
  salvarDados();
  toggleForm('form-escuteiro');
  renderEscuteiros();
  mostrarAlerta('escuteiros', 'Escuteiro adicionado com sucesso!', 'sucesso');
}

function renderEscuteiros() {
  const filtro = document.getElementById('filtro-escuteiro').value.toLowerCase();
  const secaoFiltro = document.getElementById('filtro-secao-escuteiro').value;
  
  let filtrados = escuteiros.filter(e => 
    e.nome.toLowerCase().includes(filtro) && 
    (!secaoFiltro || e.secao === secaoFiltro)
  );
  
  const tbody = document.getElementById('tabela-escuteiros');
  tbody.innerHTML = filtrados.map(e => {
    const idade = calcularIdade(e.nascimento);
    return `
      <tr>
        <td><strong>${e.nome}</strong></td>
        <td>${idade} anos</td>
        <td>${e.secao}</td>
        <td>${e.encarregado}</td>
        <td>${e.contacto}</td>
        <td><span class="badge ativo">${e.estado}</span></td>
        <td class="acoes-linha">
          <button class="btn pequeno" onclick="abrirModalEdicao('escuteiro', ${e.id})">✏️</button>
          <button class="btn pequeno perigo" onclick="marcarParaEliminar('escuteiro', ${e.id}, '${e.nome}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" class="vazio">Nenhum escuteiro encontrado</td></tr>';
}

function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

// ===== DIRIGENTES =====
function adicionarDirigente(event) {
  event.preventDefault();
  const dirigente = {
    id: Date.now(),
    nome: document.getElementById('dir-nome').value,
    funcao: document.getElementById('dir-funcao').value,
    secao: document.getElementById('dir-secao').value,
    contacto: document.getElementById('dir-contacto').value,
    estado: 'Ativo'
  };
  dirigentes.push(dirigente);
  salvarDados();
  toggleForm('form-dirigente');
  renderDirigentes();
  mostrarAlerta('dirigentes', 'Dirigente adicionado com sucesso!', 'sucesso');
}

function renderDirigentes() {
  const tbody = document.getElementById('tabela-dirigentes');
  tbody.innerHTML = dirigentes.map(d => `
    <tr>
      <td><strong>${d.nome}</strong></td>
      <td>${d.funcao}</td>
      <td>${d.secao}</td>
      <td>${d.contacto}</td>
      <td><span class="badge ativo">${d.estado}</span></td>
      <td class="acoes-linha">
        <button class="btn pequeno" onclick="abrirModalEdicao('dirigente', ${d.id})">✏️</button>
        <button class="btn pequeno perigo" onclick="marcarParaEliminar('dirigente', ${d.id}, '${d.nome}')">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="vazio">Nenhum dirigente registado</td></tr>';
}

// ===== SECÇÕES =====
function renderSecoes() {
  const secoes = [
    { nome: 'Lobitinhos', faixa: '6-8 anos', membros: 12, cor: '#7030A0' },
    { nome: 'Exploradores Júniores', faixa: '9-11 anos', membros: 15, cor: '#E0A335' },
    { nome: 'Exploradores Seniores', faixa: '12-14 anos', membros: 18, cor: '#2E8B57' },
    { nome: 'Caminheiros', faixa: '15-17 anos', membros: 10, cor: '#C0392B' }
  ];
  
  const grid = document.getElementById('grid-secoes');
  grid.innerHTML = secoes.map(s => `
    <div class="secao-card" style="border-top-color: ${s.cor};">
      <h3>${s.faixa}</h3>
      <p style="margin-bottom: 10px; color: #6E6178;">${s.nome}</p>
      <div class="contagem">${s.membros}</div>
      <p style="font-size: 0.75rem; color: #6E6178; margin-top: 4px;">membros</p>
    </div>
  `).join('');
}

// ===== SECRETARIA =====
function alternarCamposSecretaria() {
  const tipo = document.getElementById('sec-tipo').value;
  const campoEnc = document.getElementById('sec-campo-enc');
  if (tipo === 'dirigente') {
    campoEnc.style.display = 'none';
  } else {
    campoEnc.style.display = 'block';
  }
}

function cadastrarNovoMembro(event) {
  event.preventDefault();
  const cadastro = {
    id: Date.now(),
    nome: document.getElementById('sec-nome').value,
    tipo: document.getElementById('sec-tipo').value,
    nascimento: document.getElementById('sec-nasc').value,
    encarregado: document.getElementById('sec-enc').value || '-',
    contacto: document.getElementById('sec-contacto').value,
    bilhete: document.getElementById('sec-doc').value,
    data: new Date().toLocaleDateString('pt-AO')
  };
  cadastros.push(cadastro);
  salvarDados();
  document.getElementById('form-secretaria').reset();
  renderCadastros();
  mostrarAlerta('secretaria', 'Cadastramento realizado com sucesso!', 'sucesso');
}

function renderCadastros() {
  const tbody = document.getElementById('tabela-cadastros');
  tbody.innerHTML = cadastros.map(c => `
    <tr>
      <td><strong>${c.nome}</strong></td>
      <td>${c.tipo === 'escuteiro' ? '🧭 Escuteiro' : '🎖️ Dirigente'}</td>
      <td>${calcularIdade(c.nascimento)} anos</td>
      <td>${c.contacto}</td>
      <td>${c.data}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="vazio">Nenhum cadastramento realizado</td></tr>';
}

// ===== TESOURARIA =====
function adicionarPagamento(event) {
  event.preventDefault();
  const pagamento = {
    id: Date.now(),
    nome: document.getElementById('pag-nome').value,
    tipo: document.getElementById('pag-tipo').value,
    valor: parseFloat(document.getElementById('pag-valor').value),
    data: document.getElementById('pag-data').value,
    estado: document.getElementById('pag-estado').value
  };
  pagamentos.push(pagamento);
  salvarDados();
  toggleForm('form-pagamento');
  renderPagamentos();
  atualizarResumoFinanceiro();
  mostrarAlerta('tesouraria', 'Pagamento registado com sucesso!', 'sucesso');
}

function renderPagamentos() {
  const tbody = document.getElementById('tabela-pagamentos');
  tbody.innerHTML = pagamentos.map(p => `
    <tr>
      <td><strong>${p.nome}</strong></td>
      <td>${p.tipo}</td>
      <td>${p.valor.toLocaleString('pt-AO')} Kz</td>
      <td>${new Date(p.data).toLocaleDateString('pt-AO')}</td>
      <td><span class="badge ${p.estado === 'Pago' ? 'pago' : 'pendente'}">${p.estado}</span></td>
      <td class="acoes-linha">
        <button class="btn pequeno" onclick="abrirModalEdicao('pagamento', ${p.id})">✏️</button>
        <button class="btn pequeno perigo" onclick="marcarParaEliminar('pagamento', ${p.id}, '${p.nome}')">🗑️</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="vazio">Nenhum pagamento registado</td></tr>';
}

function atualizarResumoFinanceiro() {
  const pago = pagamentos.filter(p => p.estado === 'Pago').reduce((a, p) => a + p.valor, 0);
  const pendente = pagamentos.filter(p => p.estado === 'Pendente').reduce((a, p) => a + p.valor, 0);
  const total = pago + pendente;
  
  document.getElementById('res-recebido').textContent = pago.toLocaleString('pt-AO') + ' Kz';
  document.getElementById('res-pendente').textContent = pendente.toLocaleString('pt-AO') + ' Kz';
  document.getElementById('res-total').textContent = pagamentos.length;
  
  document.getElementById('rel-recebido').textContent = pago.toLocaleString('pt-AO') + ' Kz';
  document.getElementById('rel-pendente').textContent = pendente.toLocaleString('pt-AO') + ' Kz';
  document.getElementById('rel-taxa').textContent = total > 0 ? ((pago / total) * 100).toFixed(1) + '%' : '0%';
  document.getElementById('rel-transacoes').textContent = pagamentos.length;
}

// ===== RELATÓRIOS =====
function renderRelatorios() {
  renderReceitasPorTipo();
  renderDevedores();
}

function renderReceitasPorTipo() {
  const porTipo = {};
  pagamentos.forEach(p => {
    porTipo[p.tipo] = (porTipo[p.tipo] || 0) + p.valor;
  });
  
  const total = Object.values(porTipo).reduce((a, b) => a + b, 0);
  const tbody = document.getElementById('tabela-receitas-tipo');
  tbody.innerHTML = Object.entries(porTipo).map(([tipo, valor]) => {
    const percentual = ((valor / total) * 100).toFixed(1);
    return `
      <tr>
        <td>${tipo}</td>
        <td>${pagamentos.filter(p => p.tipo === tipo).length}</td>
        <td>${valor.toLocaleString('pt-AO')} Kz</td>
        <td>${percentual}%</td>
      </tr>
    `;
  }).join('');
}

function renderDevedores() {
  const devedores = pagamentos.filter(p => p.estado === 'Pendente');
  const tbody = document.getElementById('tabela-devedores');
  tbody.innerHTML = devedores.map(p => `
    <tr>
      <td><strong>${p.nome}</strong></td>
      <td>${p.tipo}</td>
      <td>${p.valor.toLocaleString('pt-AO')} Kz</td>
      <td>${new Date(p.data).toLocaleDateString('pt-AO')}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="vazio">Nenhum devedor registado</td></tr>';
}

// ===== EXPORTAÇÃO =====
function exportarPDF() {
  const elemento = document.querySelector('.conteudo');
  const opt = {
    margin: 10,
    filename: `relatorio_ag97_${new Date().toLocaleDateString('pt-AO')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'p', unit: 'mm', format: 'a4' }
  };
  html2pdf().set(opt).from(elemento).save();
  mostrarAlerta('relatorios', 'PDF exportado com sucesso!', 'sucesso');
}

function exportarCSV() {
  const dados = [];
  dados.push(['Tipo', 'Nome', 'Valor (Kz)', 'Data', 'Estado']);
  pagamentos.forEach(p => {
    dados.push([p.tipo, p.nome, p.valor, p.data, p.estado]);
  });
  
  let csv = dados.map(linha => linha.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio_ag97_${new Date().toLocaleDateString('pt-AO')}.csv`;
  link.click();
  mostrarAlerta('relatorios', 'CSV exportado com sucesso!', 'sucesso');
}

// ===== EDIÇÃO E ELIMINAÇÃO =====
function abrirModalEdicao(tipo, id) {
  let item = null;
  if (tipo === 'escuteiro') item = escuteiros.find(e => e.id === id);
  else if (tipo === 'dirigente') item = dirigentes.find(d => d.id === id);
  else if (tipo === 'pagamento') item = pagamentos.find(p => p.id === id);
  
  if (!item) return;
  
  edicaoAtual = { tipo, id, item };
  const modal = document.getElementById('modal-editar');
  const campos = document.getElementById('campos-editar');
  
  let html = '';
  if (tipo === 'escuteiro') {
    html = `
      <div><label>Nome</label><input type="text" value="${item.nome}" data-campo="nome"></div>
      <div><label>Contacto</label><input type="tel" value="${item.contacto}" data-campo="contacto"></div>
      <div><label>Encarregado</label><input type="text" value="${item.encarregado}" data-campo="encarregado"></div>
      <div class="campo-full"><label>Estado</label><select data-campo="estado"><option ${item.estado === 'Ativo' ? 'selected' : ''}>Ativo</option><option ${item.estado === 'Inativo' ? 'selected' : ''}>Inativo</option></select></div>
    `;
  } else if (tipo === 'dirigente') {
    html = `
      <div><label>Nome</label><input type="text" value="${item.nome}" data-campo="nome"></div>
      <div><label>Contacto</label><input type="tel" value="${item.contacto}" data-campo="contacto"></div>
      <div class="campo-full"><label>Estado</label><select data-campo="estado"><option ${item.estado === 'Ativo' ? 'selected' : ''}>Ativo</option><option ${item.estado === 'Inativo' ? 'selected' : ''}>Inativo</option></select></div>
    `;
  } else if (tipo === 'pagamento') {
    html = `
      <div><label>Nome</label><input type="text" value="${item.nome}" data-campo="nome"></div>
      <div><label>Valor (Kz)</label><input type="number" value="${item.valor}" data-campo="valor"></div>
      <div><label>Estado</label><select data-campo="estado"><option ${item.estado === 'Pago' ? 'selected' : ''}>Pago</option><option ${item.estado === 'Pendente' ? 'selected' : ''}>Pendente</option></select></div>
    `;
  }
  
  campos.innerHTML = html;
  document.getElementById('modal-editar-titulo').textContent = `Editar ${tipo}`;
  modal.classList.add('aberto');
}

function salvarEdicao(event) {
  event.preventDefault();
  if (!edicaoAtual) return;
  
  const campos = document.querySelectorAll('[data-campo]');
  campos.forEach(campo => {
    edicaoAtual.item[campo.dataset.campo] = campo.value;
  });
  
  salvarDados();
  fecharModalEditar();
  renderizar();
  mostrarAlerta(edicaoAtual.tipo === 'escuteiro' ? 'escuteiros' : edicaoAtual.tipo === 'dirigente' ? 'dirigentes' : 'tesouraria', 'Alterações guardadas com sucesso!', 'sucesso');
}

function marcarParaEliminar(tipo, id, nome) {
  edicaoAtual = { tipo, id };
  document.getElementById('modal-texto').textContent = `Tem a certeza que deseja eliminar "${nome}"?`;
  document.getElementById('modal-confirmar').classList.add('aberto');
}

function confirmarEliminacao() {
  if (!edicaoAtual) return;
  
  if (edicaoAtual.tipo === 'escuteiro') {
    escuteiros = escuteiros.filter(e => e.id !== edicaoAtual.id);
  } else if (edicaoAtual.tipo === 'dirigente') {
    dirigentes = dirigentes.filter(d => d.id !== edicaoAtual.id);
  } else if (edicaoAtual.tipo === 'pagamento') {
    pagamentos = pagamentos.filter(p => p.id !== edicaoAtual.id);
  }
  
  salvarDados();
  fecharModal();
  renderizar();
  mostrarAlerta(edicaoAtual.tipo === 'escuteiro' ? 'escuteiros' : edicaoAtual.tipo === 'dirigente' ? 'dirigentes' : 'tesouraria', 'Eliminado com sucesso!', 'sucesso');
}

function fecharModal() {
  document.getElementById('modal-confirmar').classList.remove('aberto');
  edicaoAtual = null;
}

function fecharModalEditar() {
  document.getElementById('modal-editar').classList.remove('aberto');
  edicaoAtual = null;
}

// ===== UTILITÁRIOS =====
function mostrarAlerta(pagina, mensagem, tipo) {
  const alerta = document.getElementById(`alerta-${pagina}`);
  if (!alerta) return;
  
  alerta.textContent = mensagem;
  alerta.className = `alerta ${tipo}`;
  setTimeout(() => {
    alerta.className = 'alerta';
  }, 4000);
}

function atualizarData() {
  const hoje = new Date().toLocaleDateString('pt-AO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  document.getElementById('dataHoje').textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);
}

function renderizar() {
  renderEscuteiros();
  renderDirigentes();
  renderCadastros();
  renderPagamentos();
  atualizarResumoFinanceiro();
}

// ===== PERSISTÊNCIA =====
function salvarDados() {
  const dados = {
    escuteiros,
    dirigentes,
    cadastros,
    pagamentos
  };
  localStorage.setItem('dados_ag97', JSON.stringify(dados));
}

function carregarDados() {
  const dados = localStorage.getItem('dados_ag97');
  if (dados) {
    const { escuteiros: e, dirigentes: d, cadastros: c, pagamentos: p } = JSON.parse(dados);
    escuteiros = e || [];
    dirigentes = d || [];
    cadastros = c || [];
    pagamentos = p || [];
  }
}
