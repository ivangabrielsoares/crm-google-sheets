class PluginConfig {
    constructor() {
        this.config = null;
        this.carregarConfig();
    }

    async carregarConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                console.warn('config.json não encontrado, usando localStorage');
                this.carregarDoLocalStorage();
                return;
            }
            this.config = await response.json();
            console.log('✅ Config carregada de config.json');
        } catch (erro) {
            console.warn('Erro ao carregar config.json:', erro);
            this.carregarDoLocalStorage();
        }
    }

    carregarDoLocalStorage() {
        const urlSalva = localStorage.getItem('scriptUrl');
        if (urlSalva) {
            this.config = { scriptUrl: urlSalva };
            console.log('✅ Config carregada de localStorage');
        } else {
            this.config = { scriptUrl: null };
            console.log('⚠️ Nenhuma config encontrada');
        }
    }

    obter(chave) {
        if (!this.config) return null;
        return this.config[chave];
    }

    definir(chave, valor) {
        if (!this.config) this.config = {};
        this.config[chave] = valor;
        localStorage.setItem(chave, valor);
    }

    obterScriptUrl() {
        return this.obter('scriptUrl');
    }

    definirScriptUrl(url) {
        this.definir('scriptUrl', url);
    }
}

const plugin_config = new PluginConfig();