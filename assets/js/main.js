document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const leftPage = document.getElementById('left-page');
    const rightPageContainer = document.getElementById('right-page-container');
    let paginaTopo, paginaFundo; // Páginas da direita que alternam

    // --- ESTADO DO JOGO ---
    let estadoAtual = { passagemId: 'prologo', subPagina: 0 };
    let isAnimating = false;

    /**
     * Renderiza o conteúdo de um estado na página da direita.
     */
    function renderizarPaginaDireita(pageElement, estado) {
        const passagem = historia[estado.passagemId];
        if (!passagem) return;

        pageElement.innerHTML = `
            <div class="face frente">
                <div class="content"></div>
                <div class="choices"></div>
                <div class="page-flipper"><button class="next-page-btn hidden">Virar página &rarr;</button></div>
            </div>
            <div class="face verso"></div>`;

        const contentDiv = pageElement.querySelector('.content');
        const choicesDiv = pageElement.querySelector('.choices');
        const btnNext = pageElement.querySelector('.next-page-btn');
        
        const paginas = passagem.texto.split('---');
        const textoDaSubPagina = paginas[estado.subPagina].trim().replace(/\n/g, '<br>');
        contentDiv.innerHTML = `<p>${textoDaSubPagina}</p>`;
        
        if (estado.subPagina < paginas.length - 1) {
            btnNext.classList.remove('hidden');
            choicesDiv.classList.add('hidden');
        } else {
            btnNext.classList.add('hidden');
            choicesDiv.classList.remove('hidden');
            
            choicesDiv.innerHTML = '';
            if (!passagem.opcoes || passagem.opcoes.length === 0) {
                choicesDiv.innerHTML = '<p><i>Fim desta parte da história...</i></p>';
                choicesDiv.style.borderTop = 'none';
            } else {
                choicesDiv.style.borderTop = '1px solid rgba(61, 43, 31, 0.1)';
                passagem.opcoes.forEach(opcao => {
                    const button = document.createElement('button');
                    button.textContent = opcao.texto;
                    button.onclick = () => fazerEscolha(opcao.destino);
                    choicesDiv.appendChild(button);
                });
            }
        }
    }
    
    /**
     * Prepara a transição, configurando o conteúdo das páginas "ocultas".
     */
    function prepararTransicao(proximoEstado) {
        const faceVerso = paginaTopo.querySelector('.face.verso');
        if (faceVerso) {
            faceVerso.innerHTML = '';
            // Clona a estrutura da página esquerda para manter a formatação.
            for (const node of leftPage.children) {
                faceVerso.appendChild(node.cloneNode(true));
            }

            // --- A CORREÇÃO DEFINITIVA ESTÁ AQUI ---
            // Encontra o título no clone...
            const tituloNoVerso = faceVerso.querySelector('.content h1');
            // ...e o atualiza com o título da PRÓXIMA página.
            const tituloProximo = historia[proximoEstado.passagemId].titulo;
            if (tituloNoVerso) {
                tituloNoVerso.textContent = tituloProximo;
            }
        }
        
        // Prepara a página de baixo com o conteúdo de texto da próxima página.
        renderizarPaginaDireita(paginaFundo, proximoEstado);
    }

    /**
     * Inicia a transição animada.
     */
    function iniciarTransicao(proximoEstado) {
        if (isAnimating) return;
        isAnimating = true;

        prepararTransicao(proximoEstado);
        
        const onAnimationEnd = () => {
            // Atualiza o título esquerdo só depois da animação.
            leftPage.querySelector('.content').innerHTML = `<h1>${historia[proximoEstado.passagemId].titulo}</h1>`;

            const paginaAntiga = paginaTopo;
            paginaAntiga.classList.remove('virando', 'em-primeiro-plano');
            
            // Troca os papéis das páginas.
            paginaAntiga.classList.remove('pagina-topo');
            paginaAntiga.classList.add('pagina-fundo');
            
            const paginaNova = paginaFundo;
            paginaNova.classList.remove('pagina-fundo');
            paginaNova.classList.add('pagina-topo');
            
            atualizarReferenciasDOM();
            estadoAtual = proximoEstado;
            isAnimating = false;
        };
        
        rightPageContainer.classList.add('em-primeiro-plano');
        paginaTopo.addEventListener('animationend', onAnimationEnd, { once: true });
        void paginaTopo.offsetHeight;
        paginaTopo.classList.add('virando');
    }
    
    function atualizarReferenciasDOM() {
        paginaTopo = document.querySelector('.pagina-topo');
        paginaFundo = document.querySelector('.pagina-fundo');
    }

    function virarPagina() {
        if (isAnimating) return;
        const paginas = historia[estadoAtual.passagemId].texto.split('---');
        if (estadoAtual.subPagina < paginas.length - 1) {
            iniciarTransicao({ ...estadoAtual, subPagina: estadoAtual.subPagina + 1 });
        }
    }

    function fazerEscolha(destinoId) {
        if (isAnimating) return;
        if (historia[destinoId]) {
            iniciarTransicao({ passagemId: destinoId, subPagina: 0 });
        }
    }
    
    // --- INICIALIZAÇÃO DO JOGO ---
    function init() {
        rightPageContainer.innerHTML = `
            <div id="pagina-A" class="pagina-direita-efeito pagina-topo"></div>
            <div id="pagina-B" class="pagina-direita-efeito pagina-fundo"></div>`;
        atualizarReferenciasDOM();
        
        leftPage.querySelector('.content').innerHTML = `<h1>${historia[estadoAtual.passagemId].titulo}</h1>`;
        renderizarPaginaDireita(paginaTopo, estadoAtual);
        
        rightPageContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('next-page-btn')) {
                virarPagina();
            }
        });
        
        // Listeners do Modal
        const optionsBtn = document.getElementById('options-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalOverlay = document.getElementById('modal-overlay');
        const optionsModal = document.getElementById('options-modal');
        function abrirMenu() { if (isAnimating) return; modalOverlay.classList.remove('hidden'); optionsModal.classList.remove('hidden'); }
        function fecharMenu() { modalOverlay.classList.add('hidden'); optionsModal.classList.add('hidden'); }
        optionsBtn.addEventListener('click', abrirMenu);
        closeModalBtn?.addEventListener('click', fecharMenu);
        modalOverlay.addEventListener('click', fecharMenu);
    }
    
    init();
});