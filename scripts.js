class TabelaTarifas {

    constructor() {
      this.tarifas = [
            {
                valorMinimo: 50.0,
                valorMaximo: 69.99,
                tempo: 30,
                descricao: "30 minutos"
            },
            {
                valorMinimo: 70.0,
                valorMaximo: 99.99,
                tempo: 60,
                tempoDescricao: "60 minutos"
            },
            {
                valorMinimo: 100,
                valorMaximo: 999999,
                tempo: 120,
                tempoDescricao: "120 minutos"
            }
        ];
    }
    // Procura qual tarifa combina com o valor pago.
    buscarTarifa(valor) {

    if (valor >= 50 && valor < 70) {
        return this.tarifas[0];
    }

    if (valor >= 70 && valor < 100) {
        return this.tarifas[1];
    }

    if (valor >= 100) {
        return this.tarifas[2];
    }else{
      return null;
    }
}
}

// CLASSE Pagamento
// Representa o dinheiro que a pessoa digitou

class Pagamento {

    constructor(valor) {

        // Converte o texto para número.
        this.valor = Number(valor);
    }

    // Verifica se o valor é válido.
    ehValido() {
      //se o valor não for número, retorne falso. Se o valor da minha propriedade for numero, retorne true.
        return !isNaN(this.valor) && this.valor > 0;
}}

class Parquimetro {

    constructor() {

        // Cria a tabela de tarifas.
        this.tabela = new TabelaTarifas();
    }
    //funcao para calcular o que? o pagamento.
    calcular(pagamento) {

        // Verifica se o pagamento é válido.
        if (!pagamento.ehValido()) {

            return {
                sucesso: false,
                mensagem: "Valor inválido"
            };
        }

        // O menor valor aceito é R$ 1,00.
        if (pagamento.valor < 1) {

            return {
                sucesso: false,
                mensagem: "Valor insuficiente"
            };
        }

        // Descobre qual tarifa será usada.
        let tarifa = this.tabela.buscarTarifa(pagamento.valor);                

        if (tarifa == null) {

            return {
                sucesso: false,
                mensagem: "Erro na tarifa"
            };
        }

        // Calcula o troco.
        let troco = pagamento.valor - tarifa.valorMinimo;

        // Arredonda para duas casas decimais.
        troco = Number(troco.toFixed(2));

        return {
            sucesso: true,
            tempo: tarifa.tempo,
            descricao: tarifa.descricao,
            troco: troco
        };
    }
}


// ==========================================
// PARTE DA TELA
// Pega os elementos do HTML
// ==========================================

let campoValor = document.getElementById("valorInput");

let botaoCalcular = document.getElementById("calcBtn");

let display = document.getElementById("displayValue");

let linhaTempo = document.getElementById("rowTempo");

let linhaTroco = document.getElementById("rowTroco");

let valorTempo = document.getElementById("valTempo");

let valorTroco = document.getElementById("valTroco");

let led = document.getElementById("ledIndicator");


// Cria o parquímetro.
let parquimetro = new Parquimetro();


// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================

function calcularEstacionamento() {

    // Pega o que a pessoa digitou.
    let valorDigitado = campoValor.value;

    // Troca vírgula por ponto.
    // Exemplo: "1,50" vira "1.50"
    valorDigitado = valorDigitado.replace(",", ".");

    // Cria um objeto Pagamento.
    let pagamento = new Pagamento(valorDigitado);

    // Faz o cálculo.
    let resultado = parquimetro.calcular(pagamento);

    // Se deu certo, mostra o resultado.
    if (resultado.sucesso) {

        mostrarResultado(resultado);

    } else {

        mostrarErro(resultado.mensagem);
    }
}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function mostrarResultado(resultado) {

    display.className = "display-value green";

    display.textContent = resultado.tempo + " MIN";

    valorTempo.textContent = resultado.descricao;

    linhaTempo.classList.add("visible");


    if (resultado.troco > 0) {

        valorTroco.textContent =
            "R$ " + resultado.troco.toFixed(2).replace(".", ",");

        valorTroco.classList.add("accent");

    } else {

        valorTroco.textContent = "Sem troco";

        valorTroco.classList.remove("accent");
    }

    linhaTroco.classList.add("visible");

    // Acende o LED verde.
    led.className = "led-indicator active";
}


// ==========================================
// MOSTRAR ERRO
// ==========================================

function mostrarErro(mensagem) {

    display.className = "display-value red";

    display.textContent = mensagem.toUpperCase();

    linhaTempo.classList.remove("visible");

    linhaTroco.classList.remove("visible");

    // Acende o LED vermelho.
    led.className = "led-indicator error";
}


// ==========================================
// BOTÃO OK
// ==========================================

botaoCalcular.addEventListener(
    "click",
    calcularEstacionamento
);


// Também permite apertar Enter.
campoValor.addEventListener("keydown", function(evento) {

    if (evento.key === "Enter") {

        calcularEstacionamento();
    }
});