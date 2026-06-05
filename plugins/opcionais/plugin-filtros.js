class PluginFiltros {
    constructor() {
        this.crm = null;
        this.filtrosAtivos = {};
        this.contatosFiltrados = [];
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin Filtros inicializado');
    }

    filtrarPorTemperatura(temperatura) {
        if (!this.crm || !this.crm.contatos) return [];

        if (temperatura === null || temperatura === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const temp = plugin_temperatura.calcularTemperatura(contato);
                return temp === temperatura;
            });
        }

        this.filtrosAtivos.temperatura = temperatura;
        return this.contatosFiltrados;
    }

    filtrarPorOrigem(origem) {
        if (!this.crm || !this.crm.contatos) return [];

        if (!origem || origem === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const origemContato = this.encontrarCampo(contato, ['origem', 'source', 'origem_lead']);
                return origemContato && String(origemContato).toLowerCase().includes(String(origem).toLowerCase());
            });
        }

        this.filtrosAtivos.origem = origem;
        return this.contatosFiltrados;
    }

    filtrarPorEtapa(etapa) {
        if (!this.crm || !this.crm.contatos) return [];

        if (!etapa || etapa === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const etapaContato = this.encontrarCampo(contato, ['etapa', 'stage', 'status']);
                return etapaContato && String(etapaContato).toLowerCase().includes(String(etapa).toLowerCase());
            });
        }

        this.filtrosAtivos.etapa = etapa;
        return this.contatosFiltrados;
    }

    filtrarPorGrupo(grupo) {
        if (!this.crm || !this.crm.contatos) return [];

        if (!grupo || grupo === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const grupoContato = this.encontrarCampo(contato, ['grupo', 'group', 'categoria', 'category']);
                return grupoContato && String(grupoContato).toLowerCase().includes(String(grupo).toLowerCase());
            });
        }

        this.filtrosAtivos.grupo = grupo;
        return this.contatosFiltrados;
    }

    filtrarPorResposta(respondeu) {
        if (!this.crm || !this.crm.contatos) return [];

        if (respondeu === null || respondeu === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const respostaContato = this.encontrarCampo(contato, ['respondeu', 'resposta', 'replied']);
                const temResposta = respostaContato && (String(respostaContato).toLowerCase() === 'sim' || String(respostaContato).toLowerCase() === 'yes');
                return respondeu === 'sim' ? temResposta : !temResposta;
            });
        }

        this.filtrosAtivos.respondeu = respondeu;
        return this.contatosFiltrados;
    }

    filtrarPorContatado(contatado) {
        if (!this.crm || !this.crm.contatos) return [];

        if (contatado === null || contatado === 'todos') {
            this.contatosFiltrados = [...this.crm.contatos];
        } else {
            this.contatosFiltrados = this.crm.contatos.filter(contato => {
                const contatoField = this.encontrarCampo(contato, ['contatei', 'contato', 'contacted']);
                const foiContatado = contatoField && (String(contatoField).toLowerCase() === 'sim' || String(contatoField).toLowerCase() === 'yes');
                return contatado === 'sim' ? foiContatado : !foiContatado;
            });
        }

        this.filtrosAtivos.contatado = contatado;
        return this.contatosFiltrados;
    }

    aplicarMultiplosFiltros(filtros) {
        if (!this.crm || !this.crm.contatos) return [];

        this.contatosFiltrados = this.crm.contatos.filter(contato => {
            // Filtro de temperatura
            if (filtros.temperatura && filtros.temperatura !== 'todos') {
                const temp = plugin_temperatura.calcularTemperatura(contato);
                if (temp !== filtros.temperatura) return false;
            }

            // Filtro de origem
            if (filtros.origem && filtros.origem !== 'todos') {
                const origemContato = this.encontrarCampo(contato, ['origem', 'source', 'origem_lead']);
                if (!origemContato || !String(origemContato).toLowerCase().includes(String(filtros.origem).toLowerCase())) {
                    return false;
                }
            }

            // Filtro de etapa
            if (filtros.etapa && filtros.etapa !== 'todos') {
                const etapaContato = this.encontrarCampo(contato, ['etapa', 'stage', 'status']);
                if (!etapaContato || !String(etapaContato).toLowerCase().includes(String(filtros.etapa).toLowerCase())) {
                    return false;
                }
            }

            // Filtro de grupo
            if (filtros.grupo && filtros.grupo !== 'todos') {
                const grupoContato = this.encontrarCampo(contato, ['grupo', 'group', 'categoria', 'category']);
                if (!grupoContato || !String(grupoContato).toLowerCase().includes(String(filtros.grupo).toLowerCase())) {
                    return false;
                }
            }

            // Filtro de resposta
            if (filtros.respondeu && filtros.respondeu !== 'todos') {
                const respostaContato = this.encontrarCampo(contato, ['respondeu', 'resposta', 'replied']);
                const temResposta = respostaContato && (String(respostaContato).toLowerCase() === 'sim' || String(respostaContato).toLowerCase() === 'yes');
                if (filtros.respondeu === 'sim' && !temResposta) return false;
                if (filtros.respondeu === 'nao' && temResposta) return false;
            }

            // Filtro de contatado
            if (filtros.contatado && filtros.contatado !== 'todos') {
                const contatoField = this.encontrarCampo(contato, ['contatei', 'contato', 'contacted']);
                const foiContatado = contatoField && (String(contatoField).toLowerCase() === 'sim' || String(contatoField).toLowerCase() === 'yes');
                if (filtros.contatado === 'sim' && !foiContatado) return false;
                if (filtros.contatado === 'nao' && foiContatado) return false;
            }

            return true;
        });

        this.filtrosAtivos = filtros;
        return this.contatosFiltrados;
    }

    limparFiltros() {
        this.filtrosAtivos = {};
        this.contatosFiltrados = this.crm ? [...this.crm.contatos] : [];
        return this.contatosFiltrados;
    }

    obterFiltrosAtivos() {
        return this.filtrosAtivos;
    }

    obterOpcoesFiltro(campo) {
        if (!this.crm || !this.crm.contatos) return [];

        const opcoes = new Set();
        this.crm.contatos.forEach(contato => {
            const valor = this.encontrarCampo(contato, [campo]);
            if (valor) opcoes.add(String(valor));
        });

        return Array.from(opcoes).sort();
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

const plugin_filtros = new PluginFiltros();