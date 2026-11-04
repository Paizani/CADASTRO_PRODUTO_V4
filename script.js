//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória e Edição)
//
const listaDeProdutos = [];
let indiceEdicao = null;
const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnSubmit = formProduto.querySelector("button[type='submit']");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputQuantidade = document.getElementById("quantidade");

//
// FASE 4: Função para Transferir Estado para Modo Edição
//
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];
    inputNome.value = produto.nome;
    inputPreco.value = produto.preco;
    inputQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações (Editar)";
    btnSubmit.classList.add("btn-warning");
}

function obterProdutosFiltrados() {
    const termo = campoBusca.value.trim().toLowerCase();
    if (!termo) {
        return listaDeProdutos;
    }
    return listaDeProdutos.filter(produto => 
        produto.nome.toLowerCase().includes(termo)
    );
}

//
// FASE 5: Escuta de Eventos
//
inputNome.addEventListener("input", function() {
    const nomeDigitado = inputNome.value.trim().toLowerCase();
    
    if (!nomeDigitado) {
        if (indiceEdicao !== null) {
            indiceEdicao = null;
            btnSubmit.textContent = "Adicionar Produto";
            btnSubmit.classList.remove("btn-warning");
            inputPreco.value = "";
            inputQuantidade.value = "";
        }
        return;
    }

    const indexEncontrado = listaDeProdutos.findIndex(
        p => p.nome.toLowerCase() === nomeDigitado
    );

    if (indexEncontrado !== -1) {
        prepararEdicao(indexEncontrado);
    } else {
        if (indiceEdicao !== null) {
            indiceEdicao = null;
            btnSubmit.textContent = "Adicionar Produto";
            btnSubmit.classList.remove("btn-warning");
            inputPreco.value = "";
            inputQuantidade.value = "";
        }
    }
});

campoBusca.addEventListener("input", function() {
    atualizarInterface();
});

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = inputNome.value.trim();
    const preco = parseFloat(inputPreco.value);
    const quantidade = parseInt(inputQuantidade.value);

    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        alert("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    const produtoValido = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produtoValido);
    } else {
        listaDeProdutos[indiceEdicao] = produtoValido;
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
    }

    salvarNoLocalStorage();
    formProduto.reset();
    atualizarInterface();
});

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
        
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");

        formProduto.reset();
        atualizarInterface();
    }
});

//
// FASE 6: Funções de Atualização e Renderização da Interface
//
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    if (indiceEdicao === index) {
        indiceEdicao = null;
        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");
        formProduto.reset();
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosParaExibir = obterProdutosFiltrados();

    produtosParaExibir.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(indexReal));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(indexReal));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 7: Inicialização da Aplicação
//
carregarDoLocalStorage();
atualizarInterface();