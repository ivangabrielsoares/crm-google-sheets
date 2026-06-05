class PluginUiModerna {
    constructor() {
        this.crm = null;
    }

    init(crm) {
        this.crm = crm;
        console.log('✅ Plugin UI Moderna inicializado');
    }

    mostrarLoadingInicial() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px; animation: bounce 2s infinite;">📱</div>
                <h2 style="color: white; margin-bottom: 10px; font-size: 24px;">CRM Google Sheets</h2>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px;">Carregando seus contatos...</p>
                <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                    <div style="height: 100%; background: white; border-radius: 2px; animation: loading 1.5s infinite;"></div>
                </div>
            </div>
            <style>
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes loading {
                    0% { width: 0%; }
                    50% { width: 100%; }
                    100% { width: 0%; }
                }
            </style>
        `;

        document.body.appendChild(overlay);
    }

    removerLoadingInicial() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s';
            setTimeout(() => overlay.remove(), 500);
        }
    }

    adicionarEfeitosHover() {
        const cards = document.querySelectorAll('.contact-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    animarMensagem(elemento) {
        elemento.style.animation = 'slideDown 0.3s ease';
    }

    criarBadge(texto, cor, fundo) {
        const badge = document.createElement('span');
        badge.textContent = texto;
        badge.style.cssText = `
            font-size: 9px;
            background: ${fundo};
            color: ${cor};
            padding: 2px 6px;
            border-radius: 8px;
            display: inline-block;
            white-space: nowrap;
        `;
        return badge;
    }

    criarBotao(texto, onclick, estilo = 'primary') {
        const btn = document.createElement('button');
        btn.textContent = texto;

        const estilos = {
            primary: 'background: #667eea; color: white;',
            success: 'background: #4CAF50; color: white;',
            danger: 'background: #f44336; color: white;',
            secondary: 'background: #2196F3; color: white;'
        };

        btn.style.cssText = `
            padding: 8px 14px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            ${estilos[estilo] || estilos.primary}
        `;

        btn.onclick = onclick;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });

        return btn;
    }

    criarFiltro(label, opcoes, onchange) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            padding: 12px 20px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
            align-items: center;
        `;

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'font-size: 12px; font-weight: 600; color: #666; margin-right: 8px;';
        container.appendChild(labelEl);

        opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.textContent = opcao.label;
            btn.style.cssText = `
                padding: 6px 12px;
                background: ${opcao.cor};
                color: white;
                border: none;
                border-radius: 18px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                opacity: 0.5;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;

            btn.onmouseover = () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            };

            btn.onmouseout = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            };

            btn.onclick = () => {
                opcoes.forEach(o => {
                    const btnTemp = container.querySelector(`[data-valor="${o.valor}"]`);
                    if (btnTemp) btnTemp.style.opacity = '0.5';
                });
                btn.style.opacity = '1';
                onchange(opcao.valor);
            };

            btn.setAttribute('data-valor', opcao.valor);
            container.appendChild(btn);
        });

        return container;
    }

    mostrarToast(mensagem, tipo = 'info', duracao = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        toast.textContent = mensagem;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    }

    criarModal(titulo, conteudo, botoes = []) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.cssText = `
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const header = document.createElement('h2');
        header.textContent = titulo;
        header.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 18px;';
        content.appendChild(header);

        const body = document.createElement('div');
        body.innerHTML = conteudo;
        content.appendChild(body);

        if (botoes.length > 0) {
            const footer = document.createElement('div');
            footer.style.cssText = 'display: flex; gap: 10px; margin-top: 24px;';

            botoes.forEach(btn => {
                const button = document.createElement('button');
                button.textContent = btn.label;
                button.style.cssText = `
                    flex: 1;
                    padding: 10px;
                    border: none;
                    color: white;
                    background: ${btn.cor || '#667eea'};
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                `;
                button.onclick = btn.onclick;
                footer.appendChild(button);
            });

            content.appendChild(footer);
        }

        modal.appendChild(content);
        document.body.appendChild(modal);

        return modal;
    }

    fecharModal(modal) {
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s';
            setTimeout(() => modal.remove(), 300);
        }
    }
}

const plugin_ui_moderna = new PluginUiModerna();