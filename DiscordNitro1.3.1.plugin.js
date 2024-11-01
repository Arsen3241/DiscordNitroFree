/**!
 * @name DiscordNitro
 * @version 1.3.1
 * @description Enhanced Discord Nitro Experience
 * @author Arseniy
 * @source https://github.com/Arsen3241/DiscordNitroFree
 * @updateUrl https://raw.githubusercontent.com/Arsen3241/DiscordNitroFree/refs/heads/main/DiscordNitro1.3.1.plugin.js
 */

"use strict";

class DiscordNitro {
    constructor() {
        this.original_premium_type = null;

        this.intervals = {
            nitro: null,
            status: null,
            caption: null
        };

        this.config = {
            updateInterval: 5000,
            statusCheckInterval: 1000,
            retryAttempts: 3,
            retryDelay: 1000
        };

        this.styles = {
            alert: {
                container: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    alignItems: "center",
                    padding: "10px"
                },
                header: {
                    fontSize: "18px",
                    color: "var(--header-primary)",
                    marginTop: "10px"
                },
                image: {
                    width: "100%",
                    maxWidth: "400px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }
            }
        };
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

        try {
            BdApi.injectCSS('DiscordNitroStyles', css);
            return true;
        } catch (error) {
            console.error('Failed to inject styles:', error);
            return false;
        }
    }

    showActivationNotice() {
        try {
            BdApi.alert(
                "Enhanced Discord Nitro",
                BdApi.React.createElement(
                    "div",
                    { style: this.styles.alert.container },
                    BdApi.React.createElement("img", {
                        src: "https://discordnitro.s3.ap-northeast-1.amazonaws.com/NitroDisc.png",
                        alt: "Nitro Premium",
                        style: this.styles.alert.image,
                        onError: (e) => {
                            e.target.style.display = 'none';
                        }
                    }),
                    BdApi.React.createElement("h4", {
                        style: this.styles.alert.header
                    }, "✨ Premium Experience Activated ✨")
                )
            );
        } catch (error) {
            console.error('Failed to show activation notice:', error);
        }
    }

    updateStatusIndicator() {
        try {
            const statusBar = document.querySelector("div[class*='typeWindows-']");
            if (!statusBar) return;

            let status = document.querySelector('.nitro-status');

            if (!status) {
                status = document.createElement('div');
                status.className = 'nitro-status';
                status.textContent = '⚡ NITRO';
                status.title = 'Discord Nitro Active';
                statusBar.insertBefore(status, statusBar.firstChild);
            }
        } catch (error) {
            console.error('Failed to update status indicator:', error);
        }
    }

    updateStreamingCaption() {
        try {
            const qualitySettingsContainer = document.querySelector("div[class^='qualitySettingsContainer']");
            if (!qualitySettingsContainer) return;

            let caption = document.querySelector('.premium-streaming-caption');

            if (!caption) {
                caption = document.createElement('div');
                caption.className = 'premium-streaming-caption';
                caption.textContent = '✨ Premium Streaming Enabled ✨';
                qualitySettingsContainer.appendChild(caption);
            }
        } catch (error) {
            console.error('Failed to update streaming caption:', error);
        }
    }

    async setPremiumStatus() {
        try {
            const userModule = BdApi.findModuleByProps("getCurrentUser");
            if (!userModule) return false;

            const currentUser = userModule.getCurrentUser();
            if (!currentUser) return false;

            if (this.original_premium_type === null) {
                this.original_premium_type = currentUser.premiumType || 0;
            }

            currentUser.premiumType = 2;
            return true;
        } catch (error) {
            console.error('Failed to set premium status:', error);
            return false;
        }
    }

    async start() {
        if (!this.injectStyles()) return;

        // Activate premium immediately
        await this.setPremiumStatus();

        // Set up intervals for UI updates
        this.intervals.status = setInterval(() => this.updateStatusIndicator(), this.config.statusCheckInterval);
        this.intervals.caption = setInterval(() => this.updateStreamingCaption(), this.config.statusCheckInterval);
        this.intervals.nitro = setInterval(() => this.setPremiumStatus(), this.config.updateInterval);

        // Show activation notice
        this.showActivationNotice();
    }

    stop() {
        try {
            // Clear intervals
            Object.values(this.intervals).forEach(interval => {
                if (interval) clearInterval(interval);
            });

            // Remove UI elements
            document.querySelector('.nitro-status')?.remove();
            document.querySelector('.premium-streaming-caption')?.remove();

            // Restore original premium type
            const userModule = BdApi.findModuleByProps("getCurrentUser");
            if (userModule) {
                const currentUser = userModule.getCurrentUser();
                if (currentUser && this.original_premium_type !== null) {
                    currentUser.premiumType = this.original_premium_type;
                }
            }

            // Remove styles
            BdApi.clearCSS('DiscordNitroStyles');
        } catch (error) {
            console.error('Error during plugin cleanup:', error);
        }
    }
}

module.exports = DiscordNitro;