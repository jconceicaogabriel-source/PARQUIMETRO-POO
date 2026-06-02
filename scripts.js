/**
 * Estacionamento — POO em JavaScript
 */
// Classe: TabelaTarifas
// Responsabilidade: encapsula as regras de tarifação
class TabelaTarifas {
  constructor() {
    // Tarifas ordenadas do menor para o maior valor
    this._tarifas = [
      { valorMinimo: 1.00, valorMaximo: 1.74, tempo: 30,  descricao: '30 minutos' },
      { valorMinimo: 1.75, valorMaximo: 2.99, tempo: 60,  descricao: '60 minutos' },
      { valorMinimo: 3.00, valorMaximo: Infinity, tempo: 120, descricao: '120 minutos (máximo permitido)' },
    ];
    this._valorMinimo = 1.00;
    this._valorMaximoAceito = 3.00;
  }
  /**
   * Retorna a tarifa que corresponde ao valor pago.
   * @param {number} valor
   * @returns {{ valorMinimo, valorMaximo, tempo, descricao } | null}
   */
  buscarTarifa(valor) {
    return this._tarifas.find(
      t => valor >= t.valorMinimo && valor <= t.valorMaximo
    ) ?? null;
  }
  get valorMinimo()      { return this._valorMinimo; }
  get valorMaximoAceito() { return this._valorMaximoAceito; }
}
// Classe: Pagamento
// Responsabilidade: representa o valor inserido pelo usuário
class Pagamento {
  constructor(valor) {
    this._valor = parseFloat(valor);
  }
  get valor() { return this._valor; }
  ehValido() {
    return !isNaN(this._valor) && this._valor > 0;
  }
  formatado() {
    return this._valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
// Classe: Ticket
// Responsabilidade: resultado do cálculo (tempo + troco)
class Ticket {
  constructor({ pagamento, tarifa }) {
    this._pagamento = pagamento;
    this._tarifa    = tarifa;
    // Troco: valor pago menos o teto da faixa (apenas se há faixa seguinte)
    const valorReferencia = Math.min(pagamento.valor, tarifa.valorMaximo === Infinity
      ? tarifa.valorMinimo  // usa o mínimo da faixa final (R$3,00)
      : tarifa.valorMinimo);
    // Troco = diferença entre o que foi pago e o mínimo da faixa aplicada
    this._troco = parseFloat((pagamento.valor - tarifa.valorMinimo).toFixed(2));
    if (this._troco < 0) this._troco = 0;
  }
  get tempo()    { return this._tarifa.tempo; }
  get descricao(){ return this._tarifa.descricao; }
  get troco()    { return this._troco; }
  get temTroco() { return this._troco > 0.001; }
  trocoFormatado() {
    return this._troco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
// Classe: Parquimetro
// Responsabilidade: orquestra o fluxo principal (Controller)
class Parquimetro {
  constructor(tabela) {
    this._tabela = tabela;
  }
  /**
   * Processa um pagamento e retorna um objeto de resultado.
   * @param {Pagamento} pagamento
   * @returns {{ sucesso: boolean, ticket?: Ticket, mensagem?: string }}
   */
  processar(pagamento) {
    if (!pagamento.ehValido()) {
      return { sucesso: false, mensagem: 'Valor inválido' };
    }
    if (pagamento.valor < this._tabela.valorMinimo) {
      return { sucesso: false, mensagem: 'Valor insuficiente' };
    }
    const tarifa = this._tabela.buscarTarifa(pagamento.valor);
    if (!tarifa) {
      return { sucesso: false, mensagem: 'Erro na tarifa' };
    }
    const ticket = new Ticket({ pagamento, tarifa });
    return { sucesso: true, ticket };
  }
}
// Classe: UIController
// Responsabilidade: manipula o DOM e renderiza os resultados
class UIController {
  constructor(parquimetro) {
    this._parquimetro = parquimetro;
    // Elementos do DOM
    this._input        = document.getElementById('valorInput');
    this._btnCalc      = document.getElementById('calcBtn');
    this._displayVal   = document.getElementById('displayValue');
    this._rowTempo     = document.getElementById('rowTempo');
    this._rowTroco     = document.getElementById('rowTroco');
    this._valTempo     = document.getElementById('valTempo');
    this._valTroco     = document.getElementById('valTroco');
    this._led          = document.getElementById('ledIndicator');
    this._bindEvents();
  }
  _bindEvents() {
    this._btnCalc.addEventListener('click', () => this._calcular());
    this._input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._calcular();
    });
    // Formata input para aceitar apenas números e vírgula/ponto
    this._input.addEventListener('input', () => {
      const raw = this._input.value.replace(/[^0-9.,]/g, '');
      this._input.value = raw;
    });
  }
  _calcular() {
    // Normaliza separador decimal (vírgula → ponto)
    const rawValue = this._input.value.replace(',', '.');
    const pagamento = new Pagamento(rawValue);
    const resultado = this._parquimetro.processar(pagamento);
    if (resultado.sucesso) {
      this._renderSucesso(resultado.ticket, pagamento);
    } else {
      this._renderErro(resultado.mensagem);
    }
  }
  _renderSucesso(ticket, pagamento) {
    // Display principal: tempo em minutos
    this._displayVal.className = 'display-value green';
    this._displayVal.textContent = `${ticket.tempo} MIN`;
    // Linha tempo
    this._valTempo.textContent = ticket.descricao;
    this._rowTempo.classList.add('visible');
    // Linha troco
    if (ticket.temTroco) {
      this._valTroco.textContent = ticket.trocoFormatado();
      this._valTroco.classList.add('accent');
      this._rowTroco.querySelector('.label').textContent = 'Troco';
      this._rowTroco.classList.add('visible');
    } else {
      this._valTroco.textContent = 'Sem troco';
      this._valTroco.classList.remove('accent');
      this._rowTroco.querySelector('.label').textContent = 'Troco';
      this._rowTroco.classList.add('visible');
    }
    // LED verde
    this._led.className = 'led-indicator active';
  }
  _renderErro(mensagem) {
    this._displayVal.className = 'display-value red';
    this._displayVal.textContent = mensagem.toUpperCase();
    // Esconde linhas de resultado
    this._rowTempo.classList.remove('visible');
    this._rowTroco.classList.remove('visible');
    // LED vermelho
    this._led.className = 'led-indicator error';
  }
  /** Reseta o display para o estado inicial */
  _resetDisplay() {
    this._displayVal.className = 'display-value idle';
    this._displayVal.textContent = '-- : --';
    this._rowTempo.classList.remove('visible');
    this._rowTroco.classList.remove('visible');
    this._led.className = 'led-indicator';
  }
}
// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  const tabela      = new TabelaTarifas();
  const parquimetro = new Parquimetro(tabela);
  new UIController(parquimetro);
});