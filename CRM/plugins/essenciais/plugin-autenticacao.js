class PluginAutenticacao {
    constructor() {
        this.crm = null;
        this.usuario = null;
        this.autenticado = false;
    }

    init(crm) {
        this.crm = crm;
        this.verificarAutenticacao();
        console.log('✅ Plugin Autenticação inicializado');
    }

    verificarAutenticacao() {
        const urlSalva = plugin_config.obterScriptUrl();
        if (urlSalva) {
            this.autenticado = true;
            this.usuario = {
                url: urlSalva,
                conectadoEm: new Date()
            };
            console.log('✅ Usuário autenticado');
            return true;
        }
        return false;
    }

    autenticar(scriptUrl) {
        if (!scriptUrl || scriptUrl.trim() === '') {
            console.error('URL inválida');
            return false;
        }

        plugin_config.definirScriptUrl(scriptUrl);
        this.usuario = {
            url: scriptUrl,
            conectadoEm: new Date()
        };
        this.autenticado = true;
        console.log('✅ Autenticação realizada');
        return true;
    }

    desautenticar() {
        this.usuario = null;
        this.autenticado = false;
        localStorage.removeItem('scriptUrl');
        console.log('✅ Desautenticado');
    }

    estaAutenticado() {
        return this.autenticado;
    }

    obterUsuario() {
        return this.usuario;
    }

    obterScriptUrl() {
        return this.usuario ? this.usuario.url : null;
    }

    validarUrl(url) {
        try {
            new URL(url);
            return url.includes('script.google.com');
        } catch (e) {
            return false;
        }
    }
}

const plugin_autenticacao = new PluginAutenticacao();