class PluginConfiguracoes {
    constructor() {
        this.crm = null;
        this.configuracoes = {
            tema: 'claro',
            notificacoes: true,
            sincronizacaoAutomatica: true,
            intervaloSincronizacao: 5000,
            contatosPorPagina: 12,
            idioma: 'pt-BR',
            mostrarTemperatura: true,
            mostrarFiltros: true,
            salvarLocalmente: true,
            ordenacao: 'nome',
            direcaoOrdenacao: 'asc'
        };
    }

    init(crm) {
        this.crm = crm;
        this.carregarConfiguracoes();
        console.log('✅ Plugin Configurações inicializado');
    }

    carregarConfiguracoes() {
        const salvas = localStorage.getItem('crm_configuracoes');
        if (salvas) {
            try {
                const parsed = JSON.parse(salvas);
                this.configuracoes = { ...this.configuracoes, ...parsed };
                console.log('✅ Configurações carregadas do localStorage');
            } catch (e) {
                console.warn('Erro ao carregar configurações:', e);
            }
        }
    }

    salvarConfiguracoes() {
        try {
            localStorage.setItem('crm_configuracoes', JSON.stringify(this.configuracoes));
            console.log('✅ Configurações salvas');
            return true;
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
            return false;
        }
    }

    obter(chave) {
        return this.configuracoes[chave];
    }

    definir(chave, valor) {
        if (chave in this.configuracoes) {
            this.configuracoes[chave] = valor;
            this.salvarConfiguracoes();
            console.log(`⚙️ Configuração '${chave}' alterada para '${valor}'`);
            return true;
        }
        console.warn(`Configuração '${chave}' não existe`);
        return false;
    }

    obterTodas() {
        return { ...this.configuracoes };
    }

    redefinirPadrao() {
        this.configuracoes = {
            tema: 'claro',
            notificacoes: true,
            sincronizacaoAutomatica: true,
            intervaloSincronizacao: 5000,
            contatosPorPagina: 12,
            idioma: 'pt-BR',
            mostrarTemperatura: true,
            mostrarFiltros: true,
            salvarLocalmente: true,
            ordenacao: 'nome',
            direcaoOrdenacao: 'asc'
        };
        this.salvarConfiguracoes();
        console.log('🔄 Configurações redefinidas para padrão');
    }

    definirTema(tema) {
        if (['claro', 'escuro', 'auto'].includes(tema)) {
            this.definir('tema', tema);
            this.aplicarTema(tema);
            return true;
        }
        return false;
    }

    aplicarTema(tema) {
        const html = document.documentElement;

        if (tema === 'escuro') {
            html.style.colorScheme = 'dark';
            document.body.style.background = '#1e1e1e';
            document.body.style.color = '#fff';
        } else if (tema === 'claro') {
            html.style.colorScheme = 'light';
            document.body.style.background = '#f5f5f5';
            document.body.style.color = '#333';
        } else if (tema === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.aplicarTema(prefersDark ? 'escuro' : 'claro');
        }
    }

    definirIdioma(idioma) {
        if (['pt-BR', 'en-US', 'es-ES'].includes(idioma)) {
            this.definir('idioma', idioma);
            return true;
        }
        return false;
    }

    obterTexto(chave) {
        const textos = {
            'pt-BR': {
                'novo_contato': 'Novo Contato',
                'editar': 'Editar',
                'deletar': 'Deletar',
                'salvar': 'Salvar',
                'cancelar': 'Cancelar',
                'buscar': 'Buscar contatos...',
                'nenhum_contato': 'Nenhum contato encontrado',
                'sincronizando': 'Sincronizando...',
                'sincronizado': 'Sincronizado',
                'erro': 'Erro na sincronização'
            },
            'en-US': {
                'novo_contato': 'New Contact',
                'editar': 'Edit',
                'deletar': 'Delete',
                'salvar': 'Save',
                'cancelar': 'Cancel',
                'buscar': 'Search contacts...',
                'nenhum_contato': 'No contacts found',
                'sincronizando': 'Syncing...',
                'sincronizado': 'Synced',
                'erro': 'Sync error'
            },
            'es-ES': {
                'novo_contato': 'Nuevo Contacto',
                'editar': 'Editar',
                'deletar': 'Eliminar',
                'salvar': 'Guardar',
                'cancelar': 'Cancelar',
                'buscar': 'Buscar contactos...',
                'nenhum_contato': 'No se encontraron contactos',
                'sincronizando': 'Sincronizando...',
                'sincronizado': 'Sincronizado',
                'erro': 'Error de sincronización'
            }
        };

        const idioma = this.configuracoes.idioma;
        return textos[idioma]?.[chave] || textos['pt-BR'][chave] || chave;
    }

    definirSincronizacaoAutomatica(ativo) {
        this.definir('sincronizacaoAutomatica', ativo);
        if (ativo && this.crm) {
            this.crm.iniciarSincronizacaoPeriodica(this.configuracoes.intervaloSincronizacao);
        } else if (!ativo && this.crm) {
            this.crm.pararSincronizacaoPeriodica();
        }
        return true;
    }

    definirIntervaloSincronizacao(ms) {
        if (ms < 1000) {
            console.warn('Intervalo mínimo é 1000ms');
            return false;
        }
        this.definir('intervaloSincronizacao', ms);
        if (this.configuracoes.sincronizacaoAutomatica && this.crm) {
            this.crm.iniciarSincronizacaoPeriodica(ms);
        }
        return true;
    }

    definirNotificacoes(ativo) {
        return this.definir('notificacoes', ativo);
    }

    definirContatosPorPagina(quantidade) {
        if (quantidade < 1 || quantidade > 100) {
            console.warn('Quantidade deve estar entre 1 e 100');
            return false;
        }
        return this.definir('contatosPorPagina', quantidade);
    }

    definirOrdenacao(campo, direcao = 'asc') {
        if (!['asc', 'desc'].includes(direcao)) {
            console.warn('Direção deve ser "asc" ou "desc"');
            return false;
        }
        this.definir('ordenacao', campo);
        this.definir('direcaoOrdenacao', direcao);
        return true;
    }

    ordenarContatos(contatos) {
        if (!contatos || contatos.length === 0) return contatos;

        const campo = this.configuracoes.ordenacao;
        const direcao = this.configuracoes.direcaoOrdenacao;

        const copia = [...contatos];
        copia.sort((a, b) => {
            const valorA = this.encontrarCampo(a, [campo]) || '';
            const valorB = this.encontrarCampo(b, [campo]) || '';

            const comparacao = String(valorA).localeCompare(String(valorB), 'pt-BR');
            return direcao === 'asc' ? comparacao : -comparacao;
        });

        return copia;
    }

    exportarConfiguracoes() {
        const json = JSON.stringify(this.configuracoes, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'crm-configuracoes.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Configurações exportadas');
    }

    importarConfiguracoes(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const configuracoes = JSON.parse(e.target.result);
                    this.configuracoes = { ...this.configuracoes, ...configuracoes };
                    this.salvarConfiguracoes();
                    resolve(true);
                    console.log('✅ Configurações importadas');
                } catch (erro) {
                    reject('Erro ao importar configurações: ' + erro.message);
                }
            };

            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsText(arquivo);
        });
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

const plugin_configuracoes = new PluginConfiguracoes();