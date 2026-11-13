
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade, 10);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
let indiceEdicao = null;
let acaoPendente = null;
let elementoAnteriorModal = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaDeProdutos));
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    if (!dadosSalvos) return;

    try {
        const produtosObjetos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosObjetos)) {
            throw new Error("Formato inválido");
        }

        produtosObjetos.forEach((prod) => {
            if (
                prod &&
                typeof prod.nome === "string" &&
                Number.isFinite(Number(prod.preco)) &&
                Number.isInteger(Number(prod.quantidade))
            ) {
                listaDeProdutos.push(
                    new Produto(prod.nome, prod.preco, prod.quantidade)
                );
            }
        });
    } catch (erro) {
        console.error("Não foi possível carregar os produtos salvos:", erro);
        localStorage.removeItem(CHAVE_STORAGE);
    }
}

const formProduto = document.getElementById("produto-form");
const btnSubmit = document.getElementById("btn-submit");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");

const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputQuantidade = document.getElementById("quantidade");

const listaSugestoes = document.getElementById("sugestoes-produtos");

const mensagemErro = document.getElementById("mensagem-erro");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const estoqueVazio = document.getElementById("estoque-vazio");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const textoConfirmacao = document.getElementById("texto-confirmacao");
const btnCancelar = document.getElementById("btn-cancelar");
const btnConfirmar = document.getElementById("btn-confirmar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnBootstrap = document.getElementById("btn-bootstrap");
const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = "block";
    mensagemSucesso.textContent = "";
    mensagemSucesso.style.display = "none";
}

function mostrarSucesso(mensagem) {
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.display = "block";
    mensagemErro.textContent = "";
    mensagemErro.style.display = "none";
}

function limparMensagens() {
    mensagemErro.textContent = "";
    mensagemSucesso.textContent = "";
    mensagemErro.style.display = "none";
    mensagemSucesso.style.display = "none";
}

function atualizarSugestoes() {
    if (!listaSugestoes) return;

    listaSugestoes.innerHTML = "";

    const nomes = listaDeProdutos.map((produto) => produto.nome);

    const nomesUnicos = [...new Set(nomes)];

    nomesUnicos.forEach((nome) => {
        const opcao = document.createElement("option");
        opcao.value = nome;
        listaSugestoes.appendChild(opcao);
    });
}

function encontrarProdutoPorNome(nome) {
    const nomePesquisado = nome.trim().toLowerCase();

    if (!nomePesquisado) return -1;

    return listaDeProdutos.findIndex((produto) =>
        produto.nome.trim().toLowerCase() === nomePesquisado
    );
}

function verificarProdutoExistente() {
    const nome = inputNome.value.trim();

    if (!nome) return;

    const indiceEncontrado = encontrarProdutoPorNome(nome);

    if (indiceEncontrado === -1) return;

    const produto = listaDeProdutos[indiceEncontrado];

    indiceEdicao = indiceEncontrado;

    inputNome.value = produto.nome;
    inputPreco.value = produto.preco;
    inputQuantidade.value = produto.quantidade;

    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");

    limparMensagens();
}

inputNome.addEventListener("input", function () {
    atualizarSugestoes();
    verificarProdutoExistente();
});

inputNome.addEventListener("change", verificarProdutoExistente);

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) return;

    indiceEdicao = index;

    inputNome.value = produto.nome;
    inputPreco.value = produto.preco;
    inputQuantidade.value = produto.quantidade;

    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");

    limparMensagens();
    inputNome.focus();
}

function cancelarEdicao() {
    indiceEdicao = null;

    formProduto.reset();

    btnSubmit.textContent = "➕ Adicionar Produto";
    btnSubmit.classList.remove("btn-warning");

    limparMensagens();
}

function obterProdutosFiltrados() {
    const termo = campoBusca.value.trim().toLowerCase();

    if (!termo) return listaDeProdutos;

    return listaDeProdutos.filter((produto) =>
        produto.nome.toLowerCase().includes(termo)
    );
}

campoBusca.addEventListener("input", atualizarInterface);

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    limparMensagens();

    const nome = inputNome.value.trim();
    const preco = Number(inputPreco.value);
    const quantidade = Number(inputQuantidade.value);

    if (!nome) {
        mostrarErro("Por favor, informe um nome válido para o produto.");
        inputNome.focus();
        return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
        mostrarErro("O preço deve ser um número maior que zero.");
        inputPreco.focus();
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarErro("A quantidade deve ser um número inteiro maior que zero.");
        inputQuantidade.focus();
        return;
    }

    const produtoDuplicado = encontrarProdutoPorNome(nome);

    if (
        produtoDuplicado !== -1 &&
        produtoDuplicado !== indiceEdicao
    ) {
        prepararEdicao(produtoDuplicado);
        mostrarErro("Este produto já está cadastrado. Os dados foram preenchidos para edição.");
        return;
    }

    const produtoValido = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produtoValido);
        mostrarSucesso("Produto cadastrado com sucesso!");
    } else {
        listaDeProdutos[indiceEdicao] = produtoValido;
        mostrarSucesso("Produto atualizado com sucesso!");
    }

    salvarNoLocalStorage();
    cancelarEdicao();
    atualizarInterface();
});

function abrirModalConfirmacao(mensagem, acao) {
    textoConfirmacao.textContent = mensagem;
    acaoPendente = acao;

    elementoAnteriorModal = document.activeElement;

    modalConfirmacao.hidden = false;
    btnCancelar.focus();
}

function fecharModalConfirmacao() {
    modalConfirmacao.hidden = true;
    acaoPendente = null;

    if (
        elementoAnteriorModal &&
        document.contains(elementoAnteriorModal)
    ) {
        elementoAnteriorModal.focus();
    }
}

btnCancelar.addEventListener("click", fecharModalConfirmacao);

btnConfirmar.addEventListener("click", function () {
    if (typeof acaoPendente !== "function") return;

    const executar = acaoPendente;

    fecharModalConfirmacao();
    executar();
});

modalConfirmacao.addEventListener("click", function (event) {
    if (event.target === modalConfirmacao) {
        fecharModalConfirmacao();
    }
});

function removerProduto(index) {
    const produto = listaDeProdutos[index];

    if (!produto) return;

    abrirModalConfirmacao(
        `Deseja realmente excluir o produto "${produto.nome}"?`,
        function () {
            listaDeProdutos.splice(index, 1);

            if (indiceEdicao === index) {
                cancelarEdicao();
            } else if (
                indiceEdicao !== null &&
                indiceEdicao > index
            ) {
                indiceEdicao--;
            }

            salvarNoLocalStorage();
            atualizarInterface();

            mostrarSucesso(
                `Produto "${produto.nome}" removido com sucesso!`
            );
        }
    );
}

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        mostrarErro("A tabela já está vazia!");
        return;
    }

    abrirModalConfirmacao(
        "Tem certeza que deseja remover todos os produtos do estoque?",
        function () {
            listaDeProdutos.length = 0;

            localStorage.removeItem(CHAVE_STORAGE);

            cancelarEdicao();
            atualizarInterface();

            mostrarSucesso("Todos os produtos foram removidos!");
        }
    );
});

function abrirModalBootstrap() {
    elementoAnteriorModal = document.activeElement;

    modalBootstrap.hidden = false;
    btnFecharBootstrap.focus();
}

function fecharModalBootstrap() {
    modalBootstrap.hidden = true;

    if (
        elementoAnteriorModal &&
        document.contains(elementoAnteriorModal)
    ) {
        elementoAnteriorModal.focus();
    }
}

btnBootstrap.addEventListener("click", abrirModalBootstrap);
btnFecharBootstrap.addEventListener("click", fecharModalBootstrap);

modalBootstrap.addEventListener("click", function (event) {
    if (event.target === modalBootstrap) {
        fecharModalBootstrap();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    if (!modalConfirmacao.hidden) {
        fecharModalConfirmacao();
    }

    if (!modalBootstrap.hidden) {
        fecharModalBootstrap();
    }
});

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acumulado, produto) => {
        return acumulado + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.innerHTML = `Total em Estoque: <span>${total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}</span>`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    const produtosParaExibir = obterProdutosFiltrados();

    produtosParaExibir.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");

        const valores = [
            produto.nome,
            produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            }),
            String(produto.quantidade),
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        ];

        valores.forEach((valor) => {
            const celula = document.createElement("td");

            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");

        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";

        btnEditar.addEventListener("click", () => {
            prepararEdicao(indexReal);
        });

        const btnRemover = document.createElement("button");

        btnRemover.type = "button";
        btnRemover.className = "btn-remover";
        btnRemover.textContent = "Remover";

        btnRemover.addEventListener("click", () => {
            removerProduto(indexReal);
        });

        celulaAcoes.append(btnEditar, btnRemover);

        linha.appendChild(celulaAcoes);
        tabelaBody.appendChild(linha);
    });

    estoqueVazio.hidden = produtosParaExibir.length !== 0;
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
    atualizarSugestoes();
}

carregarDoLocalStorage();
atualizarInterface();
limparMensagens();
