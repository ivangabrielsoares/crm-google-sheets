class PluginDuplicados {
    constructor() {
        this.crm = null;
        this.duplicados = [];
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin Duplicados inicializado');
    }

    encontrarDuplicados(campo = 'email') {
        if (!this.crm || !this.crm.contatos) return [];

        const mapa = {};
        this.duplicados = [];

        this.crm.contatos.forEach((contato, index) => {
            const valor = this.encontrarCampo(contato, [campo]);

            if (valor) {
                const chave = String(valor).toLowerCase().trim();

                if (!mapa[chave]) {
                    mapa[chave] = [];
                }

                mapa[chave].push({
                    contato: contato,
                    indice: index,
                    valor: valor
                });
            }
        });

        // Filtrar apenas os que têm duplicatas
        for (const chave in mapa) {
            if (mapa[chave].length > 1) {
                this.duplicados.push({
                    campo: campo,
                    valor: chave,
                    contatos: mapa[chave]
                });
            }
        }

        console.log(`🔍 ${this.duplicados.length} grupos de duplicados encontrados`);
        return this.duplicados;
    }

    encontrarDuplicadosPorNome() {
        return this.encontrarDuplicados('nome');
    }

    encontrarDuplicadosPorEmail() {
        return this.encontrarDuplicados('email');
    }

    encontrarDuplicadosPorTelefone() {
        return this.encontrarDuplicados('telefone');
    }

    encontrarDuplicadosAvancado(opcoes = {}) {
        if (!this.crm || !this.crm.contatos) return [];

        const {
            campos = ['email', 'telefone', 'nome'],
            sensibilidadeNome = 0.8,
            removerEspacos = true
        } = opcoes;

        const duplicadosEncontrados = [];
        const processados = new Set();

        this.crm.contatos.forEach((contato1, index1) => {
            if (processados.has(index1)) return;

            const grupo = [{ contato: contato1, indice: index1 }];

            this.crm.contatos.forEach((contato2, index2) => {
                if (index1 >= index2 || processados.has(index2)) return;

                let similaridade = 0;
                let camposComparados = 0;

                campos.forEach(campo => {
                    const valor1 = this.encontrarCampo(contato1, [campo]);
                    const valor2 = this.encontrarCampo(contato2, [campo]);

                    if (valor1 && valor2) {
                        camposComparados++;
                        const v1 = removerEspacos ? String(valor1).toLowerCase().replace(/\s/g, '') : String(valor1).toLowerCase();
                        const v2 = removerEspacos ? String(valor2).toLowerCase().replace(/\s/g, '') : String(valor2).toLowerCase();

                        if (v1 === v2) {
                            similaridade += 1;
                        } else if (campo === 'nome') {
                            // Usar similaridade fuzzy para nomes
                            const sim = this.calcularSimilaridade(v1, v2);
                            if (sim >= sensibilidadeNome) {
                                similaridade += sim;
                            }
                        }
                    }
                });

                if (camposComparados > 0 && (similaridade / camposComparados) >= 0.5) {
                    grupo.push({ contato: contato2, indice: index2 });
                    processados.add(index2);
                }
            });

            if (grupo.length > 1) {
                duplicadosEncontrados.push(grupo);
                processados.add(index1);
            }
        });

        this.duplicados = duplicadosEncontrados;
        console.log(`🔍 ${this.duplicados.length} grupos de duplicados encontrados (avançado)`);
        return this.duplicados;
    }

    mesclarDuplicados(indices) {
        if (!this.crm || !this.crm.contatos || indices.length < 2) {
            console.warn('Selecione pelo menos 2 contatos para mesclar');
            return false;
        }

        // Ordenar índices em ordem decrescente para não quebrar os índices ao remover
        indices.sort((a, b) => b - a);

        const contatoPrincipal = { ...this.crm.contatos[indices[indices.length - 1]] };

        // Mesclar dados dos outros contatos
        for (let i = 0; i < indices.length - 1; i++) {
            const contatoSecundario = this.crm.contatos[indices[i]];

            for (const chave in contatoSecundario) {
                if (!contatoPrincipal[chave] || contatoPrincipal[chave] === '') {
                    contatoPrincipal[chave] = contatoSecundario[chave];
                }
            }
        }

        // Remover contatos secundários
        for (let i = 0; i < indices.length - 1; i++) {
            this.crm.contatos.splice(indices[i], 1);
        }

        // Atualizar contato principal
        this.crm.contatos[indices[indices.length - 1]] = contatoPrincipal;

        this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
        console.log(`✅ ${indices.length} contatos mesclados`);
        return true;
    }

    removerDuplicado(indice) {
        if (!this.crm || !this.crm.contatos || indice < 0 || indice >= this.crm.contatos.length) {
            console.warn('Índice inválido');
            return false;
        }

        this.crm.contatos.splice(indice, 1);
        this.crm.emit('contatos-atualizados', { contatos: this.crm.contatos });
        console.log('✅ Contato duplicado removido');
        return true;
    }

    obterDuplicados() {
        return this.duplicados;
    }

    limparDuplicados() {
        this.duplicados = [];
    }

    calcularSimilaridade(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.calcularDistanciaEdicao(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    calcularDistanciaEdicao(str1, str2) {
        const matriz = [];

        for (let i = 0; i <= str2.length; i++) {
            matriz[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matriz[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matriz[i][j] = matriz[i - 1][j - 1];
                } else {
                    matriz[i][j] = Math.min(
                        matriz[i - 1][j - 1] + 1,
                        matriz[i][j - 1] + 1,
                        matriz[i - 1][j] + 1
                    );
                }
            }
        }

        return matriz[str2.length][str1.length];
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

const plugin_duplicados = new PluginDuplicados();