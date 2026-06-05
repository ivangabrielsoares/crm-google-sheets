class PluginExportar {
    constructor() {
        this.crm = null;
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin Exportar inicializado');
    }

    exportarCSV(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            console.warn('Nenhum contato para exportar');
            return false;
        }

        // Obter headers
        const headers = this.crm.headers || Object.keys(dados[0]);

        // Criar CSV
        let csv = headers.join(',') + '\n';

        dados.forEach(contato => {
            const linha = headers.map(header => {
                const valor = contato[header] || '';
                // Escapar aspas e envolver em aspas se contiver vírgula
                const valorEscapado = String(valor).replace(/"/g, '""');
                return valorEscapado.includes(',') ? `"${valorEscapado}"` : valorEscapado;
            }).join(',');
            csv += linha + '\n';
        });

        // Baixar arquivo
        this.baixarArquivo(csv, 'contatos.csv', 'text/csv');
        console.log('✅ CSV exportado com sucesso');
        return true;
    }

    exportarJSON(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            console.warn('Nenhum contato para exportar');
            return false;
        }

        const json = JSON.stringify(dados, null, 2);
        this.baixarArquivo(json, 'contatos.json', 'application/json');
        console.log('✅ JSON exportado com sucesso');
        return true;
    }

    exportarXLSX(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            console.warn('Nenhum contato para exportar');
            return false;
        }

        // Usar a biblioteca XLSX se disponível, senão converter para CSV
        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.json_to_sheet(dados);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Contatos');
            XLSX.writeFile(wb, 'contatos.xlsx');
            console.log('✅ XLSX exportado com sucesso');
            return true;
        } else {
            console.warn('Biblioteca XLSX não disponível, exportando como CSV');
            return this.exportarCSV(contatos);
        }
    }

    exportarPDF(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            console.warn('Nenhum contato para exportar');
            return false;
        }

        // Usar a biblioteca jsPDF se disponível
        if (typeof jsPDF !== 'undefined' && typeof autoTable !== 'undefined') {
            const doc = new jsPDF();
            const headers = this.crm.headers || Object.keys(dados[0]);

            const tableData = dados.map(contato => 
                headers.map(header => contato[header] || '')
            );

            doc.autoTable({
                head: [headers],
                body: tableData,
                margin: 10,
                styles: { fontSize: 8 }
            });

            doc.save('contatos.pdf');
            console.log('✅ PDF exportado com sucesso');
            return true;
        } else {
            console.warn('Biblioteca jsPDF não disponível');
            return false;
        }
    }

    exportarPorTemperatura() {
        if (!this.crm || !this.crm.contatos) return false;

        const quentes = this.crm.contatos.filter(c => plugin_temperatura.calcularTemperatura(c) === 'quente');
        const mornos = this.crm.contatos.filter(c => plugin_temperatura.calcularTemperatura(c) === 'morno');
        const frios = this.crm.contatos.filter(c => plugin_temperatura.calcularTemperatura(c) === 'frio');

        const resultado = {
            quentes: quentes.length,
            mornos: mornos.length,
            frios: frios.length,
            total: this.crm.contatos.length,
            dados: {
                quentes,
                mornos,
                frios
            }
        };

        const json = JSON.stringify(resultado, null, 2);
        this.baixarArquivo(json, 'contatos-por-temperatura.json', 'application/json');
        console.log('✅ Relatório de temperatura exportado');
        return true;
    }

    exportarRelatorio(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            console.warn('Nenhum contato para exportar');
            return false;
        }

        const relatorio = {
            dataExportacao: new Date().toLocaleString('pt-BR'),
            totalContatos: dados.length,
            temperaturas: {
                quentes: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'quente').length,
                mornos: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'morno').length,
                frios: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'frio').length
            },
            contatos: dados
        };

        const json = JSON.stringify(relatorio, null, 2);
        this.baixarArquivo(json, `relatorio-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        console.log('✅ Relatório exportado com sucesso');
        return true;
    }

    importarCSV(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const linhas = csv.split('\n').filter(l => l.trim());

                    if (linhas.length < 2) {
                        reject('Arquivo CSV vazio');
                        return;
                    }

                    const headers = linhas[0].split(',').map(h => h.trim());
                    const contatos = [];

                    for (let i = 1; i < linhas.length; i++) {
                        const valores = linhas[i].split(',').map(v => v.trim());
                        const contato = {};

                        headers.forEach((header, index) => {
                            contato[header] = valores[index] || '';
                        });

                        contatos.push(contato);
                    }

                    resolve(contatos);
                    console.log(`✅ ${contatos.length} contatos importados`);
                } catch (erro) {
                    reject(erro);
                }
            };

            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsText(arquivo);
        });
    }

    importarJSON(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const contatos = JSON.parse(e.target.result);

                    if (!Array.isArray(contatos)) {
                        reject('JSON deve ser um array de contatos');
                        return;
                    }

                    resolve(contatos);
                    console.log(`✅ ${contatos.length} contatos importados`);
                } catch (erro) {
                    reject('Erro ao fazer parse do JSON: ' + erro.message);
                }
            };

            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsText(arquivo);
        });
    }

    baixarArquivo(conteudo, nomeArquivo, tipo) {
        const blob = new Blob([conteudo], { type: tipo });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    obterEstatisticas(contatos = null) {
        const dados = contatos || this.crm.contatos;

        if (!dados || dados.length === 0) {
            return null;
        }

        const stats = {
            total: dados.length,
            temperaturas: {
                quentes: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'quente').length,
                mornos: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'morno').length,
                frios: dados.filter(c => plugin_temperatura.calcularTemperatura(c) === 'frio').length
            },
            comEmail: dados.filter(c => this.encontrarCampo(c, ['email', 'e-mail'])).length,
            comTelefone: dados.filter(c => this.encontrarCampo(c, ['telefone', 'phone', 'tel'])).length,
            responderam: dados.filter(c => {
                const respondeu = this.encontrarCampo(c, ['respondeu', 'resposta', 'replied']);
                return respondeu && (String(respondeu).toLowerCase() === 'sim' || String(respondeu).toLowerCase() === 'yes');
            }).length,
            foramContatados: dados.filter(c => {
                const contatado = this.encontrarCampo(c, ['contatei', 'contato', 'contacted']);
                return contatado && (String(contatado).toLowerCase() === 'sim' || String(contatado).toLowerCase() === 'yes');
            }).length
        };

        return stats;
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

const plugin_exportar = new PluginExportar();