class CRMUI {
    constructor() {
        this.contatoEmEdicao = null;
        this.modalAberto = false;
        this.paginaAtual = 1;
    }

    init() {
        console.log('🎨 UI inicializando...');

        // Verificar se está autenticado
        if (!plugin_autenticacao.estaAutenticado()) {
            this.mostrarTelaConfiguracao();
            return;
        }

        // Mostrar loading
        plugin_ui_moderna.mostrarLoadingInicial();

        // Carregar contatos
        crm.carregarContatos().then(() => {
            plugin_ui_moderna.removerLoadingInicial();
            this.mostrarConteudo();
            this.renderizarContatos();
            this.configurarEventos();
        });
    }

    mostrarTelaConfiguracao() {
        const configArea = document.getElementById('configArea');
        const contentArea = document.getElementById('contentArea');
        const headerActions = document.getElementById('headerActions');
        const btnDesconectar = document.getElementById('btnDesconectar');

        configArea.style.display = 'flex';
        contentArea.style.display = 'none';
        headerActions.style.display = 'none';
        btnDesconectar.style.display = 'none';
    }

    mostrarConteudo() {
        const configArea = document.getElementById('configArea');
        const contentArea = document.getElementById('contentArea');
        const headerActions = document.getElementById('headerActions');
        const btnDesconectar = document.getElementById('btnDesconectar');

        configArea.style.display = 'none';
        contentArea.style.display = 'flex';
        headerActions.style.display = 'flex';
        btnDesconectar.style.display = 'block';
    }

    configurarEventos() {
        // Busca
        const inputBusca = document.getElementById('busca');
        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => this.handleBusca(e.target.value));
        }

        // Listeners do CRM
        crm.on('contatos-carregados', () => this.renderizarContatos());
        crm.on('contato-adicionado', () => this.renderizarContatos());
        crm.on('contato-atualizado', () => this.renderizarContatos());
        crm.on('contato-deletado', () => this.renderizarContatos());
        crm.on('sincronizacao-iniciada', () => this.mostrarSincronizando());
        crm.on('sincronizacao-concluida', () => this.mostrarSincronizado());
        crm.on('erro-sincronizacao', (dados) => this.mostrarErroSincronizacao(dados.erro));
    }

    renderizarContatos(contatos = null) {
        const dados = contatos || crm.contatos;
        const container = document.getElementById('gridContainer');
        const totalEl = document.getElementById('totalContatos');

        if (!container) return;

        // Atualizar total
        if (totalEl) {
            totalEl.textContent = dados.length;
        }

        // Limpar container
        container.innerHTML = '';

        if (dados.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 Nenhum contato encontrado</div>';
            return;
        }

        // Renderizar cards
        dados.forEach(contato => {
            const card = this.criarCardContato(contato);
            container.appendChild(card);
        });

        // Adicionar efeitos
        plugin_ui_moderna.adicionarEfeitosHover();
    }

    criarCardContato(contato) {
        const card = document.createElement('div');
        card.className = 'contact-card';

        // Obter dados
        const nome = this.encontrarCampo(contato, ['nome', 'name']) || 'Sem nome';
        const email = this.encontrarCampo(contato, ['email', 'e-mail']) || '';
        const telefone = this.encontrarCampo(contato, ['telefone', 'phone', 'tel']) || '';
        const temperatura = plugin_temperatura.calcularTemperatura(contato);
        const cor = plugin_temperatura.obterCor(temperatura);
        const emoji = plugin_temperatura.obterEmoji(temperatura);

        // Header com cor da temperatura
        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.background = cor;
        header.innerHTML = `${emoji} ${nome}`;

        // Body
        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = `
            ${email ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">📧 ${email}</div>` : ''}
            ${telefone ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">📱 ${telefone}</div>` : ''}
            <div style="font-size: 11px; color: #999; margin-top: 12px;">
                <strong>Temperatura:</strong> ${temperatura.toUpperCase()}
            </div>
        `;

        // Footer com botões
        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const btnEditar = document.createElement('button');
        btnEditar.textContent = '✏️ Editar';
        btnEditar.style.background = '#2196F3';
        btnEditar.style.color = 'white';
        btnEditar.onclick = () => this.abrirModalEditar(contato);

        const btnDeletar = document.createElement('button');
        btnDeletar.textContent = '🗑️ Deletar';
        btnDeletar.style.background = '#f44336';
        btnDeletar.style.color = 'white';
        btnDeletar.onclick = () => this.confirmarDelecao(contato);

        footer.appendChild(btnEditar);
        footer.appendChild(btnDeletar);

        card.appendChild(header);
        card.appendChild(body);
        card.appendChild(footer);

        return card;
    }

    handleBusca(termo) {
        const resultados = crm.buscar(termo);
        this.renderizarContatos(resultados);
    }

    abrirModalAdicionar() {
        this.contatoEmEdicao = {};
        this.abrirModal('Novo Contato', true);
    }

    abrirModalEditar(contato) {
        this.contatoEmEdicao = { ...contato };
        this.abrirModal('Editar Contato', false);
    }

    abrirModal(titulo, isNovo = false) {
        const modal = document.getElementById('modal');
        const modalHeader = document.getElementById('modalHeader');
        const modalFormFields = document.getElementById('modalFormFields');

        if (!modal || !modalHeader || !modalFormFields) return;

        modalHeader.textContent = titulo;
        modalFormFields.innerHTML = '';

        // Obter headers do CRM
        const headers = crm.headers.length > 0 ? crm.headers : Object.keys(this.contatoEmEdicao);

        // Criar campos do formulário
        headers.forEach(header => {
            const grupo = document.createElement('div');
            grupo.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = header;
            label.style.cssText = 'display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #666;';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = this.contatoEmEdicao[header] || '';
            input.style.cssText = 'width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; font-family: inherit;';
            input.addEventListener('focus', () => {
                input.style.borderColor = '#667eea';
                input.style.boxShadow = '0 0 0 2px rgba(102,126,234,0.1)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = '#ddd';
                input.style.boxShadow = 'none';
            });

            grupo.appendChild(label);
            grupo.appendChild(input);
            modalFormFields.appendChild(grupo);
        });

        modal.classList.add('active');
        this.modalAberto = true;
    }

    fecharModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
            this.modalAberto = false;
        }
    }

    salvarEdicao() {
        const modalFormFields = document.getElementById('modalFormFields');
        if (!modalFormFields) return;

        const inputs = modalFormFields.querySelectorAll('input');
        const headers = crm.headers.length > 0 ? crm.headers : Object.keys(this.contatoEmEdicao);

        inputs.forEach((input, index) => {
            this.contatoEmEdicao[headers[index]] = input.value;
        });

        // Verificar se é novo ou edição
        if (!this.contatoEmEdicao.id) {
            this.contatoEmEdicao.id = Math.random().toString(36).substr(2, 9);
            crm.salvarContato(this.contatoEmEdicao);
        } else {
            crm.atualizarContato(this.contatoEmEdicao.id, this.contatoEmEdicao);
        }

        this.fecharModal();
        plugin_ui_moderna.mostrarToast('✅ Contato salvo com sucesso!', 'success');
    }

    confirmarDelecao(contato) {
        const modal = plugin_ui_moderna.criarModal(
            'Confirmar Deleção',
            `<p>Tem certeza que deseja deletar <strong>${this.encontrarCampo(contato, ['nome', 'name']) || 'este contato'}</strong>?</p>`,
            [
                {
                    label: 'Deletar',
                    cor: '#f44336',
                    onclick: () => {
                        crm.deletarContato(contato.id);
                        plugin_ui_moderna.fecharModal(modal);
                        plugin_ui_moderna.mostrarToast('✅ Contato deletado!', 'success');
                    }
                },
                {
                    label: 'Cancelar',
                    cor: '#999',
                    onclick: () => plugin_ui_moderna.fecharModal(modal)
                }
            ]
        );
    }

    mostrarSincronizando() {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.classList.add('syncing');
            const dot = indicator.querySelector('.sync-dot');
            const span = indicator.querySelector('span');
            if (dot) dot.classList.add('syncing');
            if (span) span.textContent = 'Sincronizando...';
        }
    }

    mostrarSincronizado() {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.classList.remove('syncing');
            indicator.classList.remove('error');
            const dot = indicator.querySelector('.sync-dot');
            const span = indicator.querySelector('span');
            if (dot) {
                dot.classList.remove('syncing');
                dot.classList.remove('error');
            }
            if (span) span.textContent = 'Sincronizado';
        }
    }

    mostrarErroSincronizacao(erro) {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.classList.add('error');
            const dot = indicator.querySelector('.sync-dot');
            const span = indicator.querySelector('span');
            if (dot) dot.classList.add('error');
            if (span) span.textContent = 'Erro na sincronização';
        }
        plugin_ui_moderna.mostrarToast(`❌ Erro: ${erro}`, 'error');
    }

    configurarURL() {
        const input = document.getElementById('scriptUrl');
        if (!input || !input.value) {
            plugin_ui_moderna.mostrarToast('❌ Digite uma URL válida', 'error');
            return;
        }

        const url = input.value.trim();

        if (!plugin_autenticacao.validarUrl(url)) {
            plugin_ui_moderna.mostrarToast('❌ URL do Google Apps Script inválida', 'error');
            return;
        }

        if (plugin_autenticacao.autenticar(url)) {
            crm.scriptUrl = url;
            plugin_ui_moderna.mostrarToast('✅ Conectado com sucesso!', 'success');
            setTimeout(() => {
                this.init();
            }, 500);
        } else {
            plugin_ui_moderna.mostrarToast('❌ Erro ao conectar', 'error');
        }
    }

    desconectar() {
        const modal = plugin_ui_moderna.criarModal(
            'Desconectar',
            '<p>Tem certeza que deseja desconectar?</p>',
            [
                {
                    label: 'Desconectar',
                    cor: '#f44336',
                    onclick: () => {
                        plugin_autenticacao.desautenticar();
                        plugin_ui_moderna.fecharModal(modal);
                        location.reload();
                    }
                },
                {
                    label: 'Cancelar',
                    cor: '#999',
                    onclick: () => plugin_ui_moderna.fecharModal(modal)
                }
            ]
        );
    }

    encontrarCampo(contato, nomesPossiveis) {
        if (!contato) return null;

        for (const nome of nomesPossiveis) {
            for (const chave in contato) {
                if (chave.toLowerCase().includes(nome.toLowerCase()) && contato[chave]) {
                    return contato[chave];
                }
            }
        }
        return null;
    }
}

const ui = new CRMUI();