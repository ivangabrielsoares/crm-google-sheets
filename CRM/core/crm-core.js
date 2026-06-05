class CRMCore {
    constructor() {
        this.contatos = [];
        this.headers = [];
        this.scriptUrl = null;
        this.listeners = {};
        this.sincronizandoAtualmente = false;
        this.intervaloSincronizacao = null;
        this.ultimaSincronizacao = null;
    }

    init() {
        console.log('🚀 CRM Core inicializando...');

        // Verificar autenticação
        if (!plugin_autenticacao.verificarAutenticacao()) {
            console.log('⚠️ Usuário não autenticado');
            return false;
        }

        this.scriptUrl = plugin_autenticacao.obterScriptUrl();

        // Inicializar plugins
        this.inicializarPlugins();

        console.log('✅ CRM Core inicializado');
        return true;
    }

    inicializarPlugins() {
        plugin_temperatura.init(this);
        plugin_ui_moderna.init(this);
        plugin_filtros.init(this);
        plugin_desfazer.init(this);
        plugin_exportar.init(this);
        plugin_duplicados.init(this);
        plugin_configuracoes.init(this);
    }

    async carregarContatos() {
        if (!this.scriptUrl) {
            console.error('URL do script não configurada');
            return false;
        }

        try {
            this.sincronizandoAtualmente = true;
            this.emit('sincronizacao-iniciada');

            const response = await fetch(this.scriptUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const dados = await response.json();

            if (!dados.dados || !Array.isArray(dados.dados)) {
                throw new Error('Formato de resposta inválido');
            }

            this.contatos = dados.dados;
            this.headers = dados.headers || Object.keys(this.contatos[0] || {});
            this.ultimaSincronizacao = new Date();

            console.log(`✅ ${this.contatos.length} contatos carregados`);
            this.emit('contatos-carregados', { contatos: this.contatos });
            this.emit('sincronizacao-concluida');

            return true;
        } catch (erro) {
            console.error('Erro ao carregar contatos:', erro);
            this.emit('erro-sincronizacao', { erro: erro.message });
            return false;
        } finally {
            this.sincronizandoAtualmente = false;
        }
    }

    async salvarContato(contato) {
        if (!this.scriptUrl) {
            console.error('URL do script não configurada');
            return false;
        }

        try {
            const payload = {
                acao: 'adicionar',
                contato: contato
            };

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.sucesso) {
                contato.id = resultado.id || Math.random().toString(36).substr(2, 9);
                this.contatos.push(contato);

                plugin_desfazer.registrarAcao('adicionar', contato);
                this.emit('contato-adicionado', { contato });

                console.log('✅ Contato salvo');
                return true;
            } else {
                throw new Error(resultado.mensagem || 'Erro ao salvar');
            }
        } catch (erro) {
            console.error('Erro ao salvar contato:', erro);
            this.emit('erro-salvar', { erro: erro.message });
            return false;
        }
    }

    async atualizarContato(id, dadosAtualizados) {
        if (!this.scriptUrl) {
            console.error('URL do script não configurada');
            return false;
        }

        try {
            const contatoAnterior = this.contatos.find(c => c.id === id);
            if (!contatoAnterior) {
                throw new Error('Contato não encontrado');
            }

            const payload = {
                acao: 'atualizar',
                id: id,
                contato: dadosAtualizados
            };

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.sucesso) {
                const indice = this.contatos.findIndex(c => c.id === id);
                this.contatos[indice] = { ...this.contatos[indice], ...dadosAtualizados };

                plugin_desfazer.registrarAcao('editar', {
                    id: id,
                    anterior: contatoAnterior,
                    novo: dadosAtualizados
                });

                this.emit('contato-atualizado', { contato: this.contatos[indice] });
                console.log('✅ Contato atualizado');
                return true;
            } else {
                throw new Error(resultado.mensagem || 'Erro ao atualizar');
            }
        } catch (erro) {
            console.error('Erro ao atualizar contato:', erro);
            this.emit('erro-atualizar', { erro: erro.message });
            return false;
        }
    }

    async deletarContato(id) {
        if (!this.scriptUrl) {
            console.error('URL do script não configurada');
            return false;
        }

        try {
            const contatoADeletar = this.contatos.find(c => c.id === id);
            if (!contatoADeletar) {
                throw new Error('Contato não encontrado');
            }

            const payload = {
                acao: 'deletar',
                id: id
            };

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.sucesso) {
                this.contatos = this.contatos.filter(c => c.id !== id);

                plugin_desfazer.registrarAcao('deletar', contatoADeletar);
                this.emit('contato-deletado', { id });

                console.log('✅ Contato deletado');
                return true;
            } else {
                throw new Error(resultado.mensagem || 'Erro ao deletar');
            }
        } catch (erro) {
            console.error('Erro ao deletar contato:', erro);
            this.emit('erro-deletar', { erro: erro.message });
            return false;
        }
    }

    iniciarSincronizacaoPeriodica(intervalo = 5000) {
        if (this.intervaloSincronizacao) {
            clearInterval(this.intervaloSincronizacao);
        }

        this.intervaloSincronizacao = setInterval(() => {
            this.carregarContatos();
        }, intervalo);

        console.log(`⏱️ Sincronização periódica iniciada (${intervalo}ms)`);
    }

    pararSincronizacaoPeriodica() {
        if (this.intervaloSincronizacao) {
            clearInterval(this.intervaloSincronizacao);
            this.intervaloSincronizacao = null;
            console.log('⏹️ Sincronização periódica parada');
        }
    }

    buscar(termo) {
        if (!termo || termo.trim() === '') {
            return this.contatos;
        }

        const termoLower = termo.toLowerCase();
        return this.contatos.filter(contato => {
            for (const chave in contato) {
                if (String(contato[chave]).toLowerCase().includes(termoLower)) {
                    return true;
                }
            }
            return false;
        });
    }

    obterContato(id) {
        return this.contatos.find(c => c.id === id);
    }

    obterTodos() {
        return this.contatos;
    }

    obterTotal() {
        return this.contatos.length;
    }

    obterHeaders() {
        return this.headers;
    }

    on(evento, callback) {
        if (!this.listeners[evento]) {
            this.listeners[evento] = [];
        }
        this.listeners[evento].push(callback);
    }

    off(evento, callback) {
        if (!this.listeners[evento]) return;
        this.listeners[evento] = this.listeners[evento].filter(cb => cb !== callback);
    }

    emit(evento, dados = {}) {
        if (!this.listeners[evento]) return;
        this.listeners[evento].forEach(callback => {
            try {
                callback(dados);
            } catch (erro) {
                console.error(`Erro no listener de '${evento}':`, erro);
            }
        });
    }

    obterUltimaSincronizacao() {
        return this.ultimaSincronizacao;
    }

    estaSincronizando() {
        return this.sincronizandoAtualmente;
    }
}

const crm = new CRMCore();