class PluginTemperatura {
    constructor() {
        this.crm = null;
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin Temperatura inicializado');
    }

    calcularTemperatura(contato) {
        let score = 0;

        // 1. RESPONDEU (mais importante) - 50 pontos
        const respondeu = this.encontrarCampo(contato, ['respondeu', 'resposta', 'replied']);
        if (respondeu && (String(respondeu).toLowerCase() === 'sim' || String(respondeu).toLowerCase() === 'yes')) {
            score += 50;
        }

        // 2. JÁ FOI CONTATADO - 35 pontos
        const contatei = this.encontrarCampo(contato, ['contatei', 'contato', 'contacted']);
        if (contatei && (String(contatei).toLowerCase() === 'sim' || String(contatei).toLowerCase() === 'yes')) {
            score += 35;
        }

        // 3. DATA DE CADASTRO (recência) - até 30 pontos
        const entrada = this.encontrarCampo(contato, ['entrada', 'data cadastro', 'data_cadastro', 'created_date', 'data']);
        if (entrada) {
            try {
                const data = new Date(entrada);
                if (!isNaN(data.getTime())) {
                    const agora = new Date();
                    const diasAtras = (agora - data) / (1000 * 60 * 60 * 24);

                    if (diasAtras < 3) score += 30;
                    else if (diasAtras < 7) score += 25;
                    else if (diasAtras < 14) score += 15;
                    else if (diasAtras < 30) score += 10;
                    else if (diasAtras < 60) score += 5;
                }
            } catch (e) {
                console.log('Erro ao processar data:', entrada);
            }
        }

        // 4. ORIGEM DO LEAD - até 20 pontos
        const origem = this.encontrarCampo(contato, ['origem', 'source', 'origem_lead']);
        if (origem) {
            const origemLower = String(origem).toLowerCase();
            if (origemLower.includes('indicação') || origemLower.includes('referral') || origemLower.includes('indicado')) {
                score += 20;
            } else if (origemLower.includes('direto') || origemLower.includes('direct')) {
                score += 15;
            } else if (origemLower.includes('site') || origemLower.includes('website')) {
                score += 10;
            } else if (origemLower.includes('rede') || origemLower.includes('social')) {
                score += 8;
            }
        }

        // 5. ETAPA DO FUNIL - até 15 pontos
        const etapa = this.encontrarCampo(contato, ['etapa', 'stage', 'status']);
        if (etapa) {
            const etapaLower = String(etapa).toLowerCase();
            if (etapaLower.includes('proposta') || etapaLower.includes('proposal')) {
                score += 15;
            } else if (etapaLower.includes('negociação') || etapaLower.includes('negotiation')) {
                score += 12;
            } else if (etapaLower.includes('qualificado') || etapaLower.includes('qualified')) {
                score += 10;
            } else if (etapaLower.includes('contato') || etapaLower.includes('contact')) {
                score += 5;
            }
        }

        // 6. GRUPO/CATEGORIA - até 10 pontos
        const grupo = this.encontrarCampo(contato, ['grupo', 'group', 'categoria', 'category']);
        if (grupo) {
            const grupoLower = String(grupo).toLowerCase();
            if (grupoLower.includes('vip') || grupoLower.includes('premium')) {
                score += 10;
            } else if (grupoLower.includes('prioritário') || grupoLower.includes('priority')) {
                score += 8;
            }
        }

        // Classificar por score
        if (score >= 70) return 'quente';
        if (score >= 40) return 'morno';
        return 'frio';
    }

    obterCor(temperatura) {
        const cores = {
            'quente': '#ff6b6b',
            'morno': '#ffa500',
            'frio': '#4da6ff'
        };
        return cores[temperatura] || '#667eea';
    }

    obterEmoji(temperatura) {
        const emojis = {
            'quente': '🔥',
            'morno': '🟠',
            'frio': '❄️'
        };
        return emojis[temperatura] || '📊';
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

const plugin_temperatura = new PluginTemperatura();