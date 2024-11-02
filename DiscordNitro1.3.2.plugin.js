/**!
 * @name DiscordNitro
 * @version 1.3.2
 * @description Enhanced Discord Nitro Experience
 * @autor Arseniy
 * @source https://github.com/Arsen3241/DiscordNitroFree
 * @updateUrl https://raw.githubusercontent.com/Arsen3241/DiscordNitroFree/refs/heads/main/DiscordNitro1.3.1.plugin.js
 */

"use strict";

class DiscordNitro {
    constructor() {
        this.original_premium_type = null;
        this.intervals = [];
        this.updateInterval = 5000;
    }

    injectStyles() {
        const css = `
            @keyframes rainbow {
                0% { color: #ff0000; }
                17% { color: #ff8000; }
                33% { color: #ffff00; }
                50% { color: #00ff00; }
                67% { color: #0080ff; }
                84% { color: #8000ff; }
                100% { color: #ff0000; }
            }

            .nitro-status {
                padding: 5px 10px;
                border-radius: 4px;
                background: linear-gradient(45deg, #0073e6, #00c3ff);
                color: white;
                font-weight: bold;
                margin-right: 10px;
                cursor: default;
                user-select: none;
            }

            .premium-streaming-caption {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
                margin-bottom: 5px;
                animation: rainbow 6s linear infinite;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        `;
        BdApi.injectCSS('DiscordNitroStyles', css);
    }

    showActivationNotice() {
        BdApi.alert(
            "Enhanced Discord Nitro",
            BdApi.React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", padding: "10px" } },
                BdApi.React.createElement("img", {
                    src: "https://discordnitro.s3.ap-northeast-1.amazonaws.com/NitroDisc.png",
                    alt: "Nitro Premium",
                    style: { width: "100%", maxWidth: "400px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }
                }),
                BdApi.React.createElement("h4", {
                    style: { fontSize: "18px", color: "var(--header-primary)", marginTop: "10px" }
                }, "✨ Premium Experience Activated ✨")
            )
        );
    }

    updateUI() {
        const statusBar = document.querySelector("div[class*='typeWindows-']");
        if (statusBar && !document.querySelector('.nitro-status')) {
            const status = document.createElement('div');
            status.className = 'nitro-status';
            status.textContent = '⚡ NITRO';
            status.title = 'Discord Nitro Active';
            statusBar.insertBefore(status, statusBar.firstChild);
        }

        const qualitySettingsContainer = document.querySelector("div[class^='qualitySettingsContainer']");
        if (qualitySettingsContainer && !document.querySelector('.premium-streaming-caption')) {
            const caption = document.createElement('div');
            caption.className = 'premium-streaming-caption';
            caption.textContent = '✨ Premium Streaming Enabled ✨';
            qualitySettingsContainer.appendChild(caption);
        }
    }

    setPremiumStatus() {
        const userModule = BdApi.findModuleByProps("getCurrentUser");
        if (userModule) {
            const currentUser = userModule.getCurrentUser();
            if (currentUser) {
                if (this.original_premium_type === null) {
                    this.original_premium_type = currentUser.premiumType || 0;
                }
                currentUser.premiumType = 2;
            }
        }
    }

    start() {
        this.injectStyles();
        this.setPremiumStatus();
        this.showActivationNotice();

        this.intervals.push(
            setInterval(() => this.updateUI(), 1000),
            setInterval(() => this.setPremiumStatus(), this.updateInterval)
        );
    }

    stop() {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        document.querySelector('.nitro-status')?.remove();
        document.querySelector('.premium-streaming-caption')?.remove();
        BdApi.clearCSS('DiscordNitroStyles');

        const userModule = BdApi.findModuleByProps("getCurrentUser");
        if (userModule?.getCurrentUser() && this.original_premium_type !== null) {
            userModule.getCurrentUser().premiumType = this.original_premium_type;
        }
    }
}

module.exports = DiscordNitro;