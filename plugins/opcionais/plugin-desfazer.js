class PluginDesfazer {
    constructor() {
        this.crm = null;
        this.historico = [];
        this.indiceAtual = -1;
        this.maxHistorico = 50;
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin Desfazer inicializado');
    }

    registrarAcao(tipo, dados) {
        // Remove ações futuras se estamos no meio do histórico
        if (this.indiceAtual < this.historico.length - 1) {
            this.historico = this.historico.slice(0, this.indiceAtual + 1);
        }

        // Adiciona nova ação
        this.historico.push({
            tipo: tipo,
            dados: JSON.parse(JSON.stringify(dados)),
            timestamp: new Date(),
            id: Math.random().toString(36).substr(2, 9)
        });

        // Limita tamanho do histórico
        if (this.historico.length > this.maxHistorico) {
            this.historico.shift();
        } else {
            this.indiceAtual++;
        }

        console.log(`📝 Ação registrada: ${tipo}`);
    }

    desfazer() {
        if (this.indiceAtual <= 0) {
            console.warn('Nada para desfazer');
            return false;
        }

        this.indiceAtual--;
        const acao = this.historico[this.indiceAtual];
        this.executarDesfazer(acao);
        return true;
    }

    refazer() {
        if (this.indiceAtual >= this.historico.length - 1) {
            console.warn('Nada para refazer');
            return false;
        }

        this.indiceAtual++;
        const acao = this.historico[this.indiceAtual];
        this.executarRefazer(acao);
        return true;
    }

    executarDesfazer(acao) {
        switch (acao.tipo) {
            case 'adicionar':
                this.desfazerAdicionar(acao.dados);
                break;
            case 'editar':
                this.desfazerEditar(acao.dados);
                break;
            case 'deletar':
                this.desfazerDeletar(acao.dados);
                break;
            default:
                console.warn('Tipo de ação desconhecido:', acao.tipo);
        }
    }

    executarRefazer(acao) {
        switch (acao.tipo) {
            case 'adicionar':
                this.refazerAdicionar(acao.dados);
                break;
            case 'editar':
                this.refazerEditar(acao.dados);
                break;
            case 'deletar':
                this.refazerDeletar(acao.dados);
                break;
            default:
                console.warn('Tipo de ação desconhecido:', acao.tipo);
        }
    }

    desfazerAdicionar(dados) {
        if (this.crm && this.crm.contatos) {
            this.crm.contatos = this.crm.contatos.filter(c => c.id !== dados.id);
            this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
            console.log('↩️ Adição desfeita');
        }
    }

    desfazerEditar(dados) {
        if (this.crm && this.crm.contatos) {
            const contato = this.crm.contatos.find(c => c.id === dados.id);
            if (contato) {
                Object.assign(contato, dados.anterior);
                this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
                console.log('↩️ Edição desfeita');
            }
        }
    }

    desfazerDeletar(dados) {
        if (this.crm && this.crm.contatos) {
            this.crm.contatos.push(dados);
            this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
            console.log('↩️ Deleção desfeita');
        }
    }

    refazerAdicionar(dados) {
        if (this.crm && this.crm.contatos) {
            this.crm.contatos.push(dados);
            this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
            console.log('🔄 Adição refeita');
        }
    }

    refazerEditar(dados) {
        if (this.crm && this.crm.contatos) {
            const contato = this.crm.contatos.find(c => c.id === dados.id);
            if (contato) {
                Object.assign(contato, dados.novo);
                this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
                console.log('🔄 Edição refeita');
            }
        }
    }

    refazerDeletar(dados) {
        if (this.crm && this.crm.contatos) {
            this.crm.contatos = this.crm.contatos.filter(c => c.id !== dados.id);
            this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
            console.log('🔄 Deleção refeita');
        }
    }

    podeDesfazer() {
        return this.indiceAtual > 0;
    }

    podeRefazer() {
        return this.indiceAtual < this.historico.length - 1;
    }

    limparHistorico() {
        this.historico = [];
        this.indiceAtual = -1;
        console.log('🗑️ Histórico limpo');
    }

    obterHistorico() {
        return this.historico.map((acao, index) => ({
            ...acao,
            ativo: index === this.indiceAtual
        }));
    }
}

const plugin_desfazer = new PluginDesfazer();