/**!
 * @name DiscordNitro
 * @version 1.3.0
 * @description Enhanced Discord Nitro Experience
 * @author Arseniy
 */

"use strict";

class DiscordNitro {
    constructor() {
        // Save the original account type during initialization
        this.old_account_type = null;

        this.intervals = {
            ui: null,
            nitro: null,
            status: null
        };

        this.config = {
            updateInterval: 5000,
            uiCheckInterval: 500,
            retryAttempts: 3,
            retryDelay: 1000
        };

        this.styles = {
            common: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--interactive-normal)",
                lineHeight: "16px",
                textTransform: "uppercase",
                marginTop: "10px",
                marginBottom: "5px"
            },
            caption: {
                color: "var(--header-primary)",
                fontSize: "12px",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                animation: "glow 2s ease-in-out infinite alternate"
            },
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
        try {
            const css = `
                @keyframes glow {
                    from {
                        text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6;
                    }
                    to {
                        text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6;
                    }
                }

                .nitro-status {
                    padding: 5px 10px;
                    border-radius: 4px;
                    background: linear-gradient(45deg, #0073e6, #00c3ff);
                    color: white;
                    font-weight: bold;
                    animation: glow 2s ease-in-out infinite alternate;
                    margin-right: 10px;
                    cursor: default;
                    user-select: none;
                }
            `;
            BdApi.injectCSS('DiscordNitroStyles', css);
            return true;
        } catch (error) {
            console.error('Failed to inject styles:', error);
            return false;
        }
    }

    showInfo() {
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
                    }, "✨ Premium Experience Activated ✨"),
                    BdApi.React.createElement("p", {
                        style: { color: "var(--text-normal)" }
                    }, "Enjoy enhanced streaming quality with 1440p 60 FPS!")
                )
            );
        } catch (error) {
            console.error('Failed to show info dialog:', error);
        }
    }

    async createStatusIndicator() {
        try {
            const statusBar = document.querySelector("div[class*='typeWindows-']");
            if (!statusBar) return;

            // Remove the old indicator if it exists
            const existingStatus = document.querySelector('.nitro-status');
            if (existingStatus) existingStatus.remove();

            const status = document.createElement('div');
            status.className = 'nitro-status';
            status.textContent = '⚡ NITRO ACTIVE';

            // Add hover handler
            status.title = 'Discord Nitro Premium Active';

            statusBar.insertBefore(status, statusBar.firstChild);
        } catch (error) {
            console.error('Failed to create status indicator:', error);
        }
    }

    async caption() {
        try {
            const qualitySettingsContainer = document.querySelector("div[class^='qualitySettingsContainer']");
            if (!qualitySettingsContainer) return;

            // Remove old captions
            const existingCaptions = document.getElementsByClassName("NitroStreams-caption");
            Array.from(existingCaptions).forEach(caption => caption.remove());

            const captionElement = BdApi.React.createElement("h6", {
                style: { ...this.styles.common, ...this.styles.caption },
                className: "NitroStreams-caption"
            }, "✨ Premium Streaming Enabled ✨");

            const container = document.createElement("div");
            BdApi.ReactDOM.render(captionElement, container);
            qualitySettingsContainer.appendChild(container);
        } catch (error) {
            console.error('Failed to create caption:', error);
        }
    }

    async setNitro(retryCount = 0) {
        try {
            const currentUser = BdApi.findModuleByProps("getCurrentUser").getCurrentUser();
            if (currentUser) {
                currentUser.premiumType = 2;
                return true;
            }

            // If the user is not found and there are attempts left, try again
            if (retryCount < this.config.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this.setNitro(retryCount + 1);
            }
            return false;
        } catch (error) {
            console.error('Failed to set Nitro status:', error);
            return false;
        }
    }

    // Ensure the info dialog is shown every time the plugin loads
    load() {
        if (BdApi.loadData("DiscordNitro", "loaded") !== true) {
            this.showInfo();
            BdApi.saveData("DiscordNitro", "loaded", true);
        } else {
            this.showInfo();
        }
    }

    async start() {
        // Save the current account type
        try {
            const currentUser = BdApi.findModuleByProps("getCurrentUser").getCurrentUser();
            this.old_account_type = currentUser?.premiumType || 0;
        } catch (error) {
            console.error('Failed to save original account type:', error);
            this.old_account_type = 0;
        }

        // Initialize styles
        if (!this.injectStyles()) {
            console.error('Failed to initialize styles');
            return;
        }

        // Set intervals
        this.intervals.ui = setInterval(() => this.caption(), this.config.uiCheckInterval);
        this.intervals.status = setInterval(() => this.createStatusIndicator(), this.config.uiCheckInterval);

        // Activate Nitro with retry attempts
        const nitroSet = await this.setNitro();
        if (nitroSet) {
            this.intervals.nitro = setInterval(() => this.setNitro(), this.config.updateInterval);
            //this.showInfo(); <- Removed to prevent multiple dialogs and аnd it doesn't show up every time you start up.
        } else {
            console.error('Failed to initialize Nitro status after multiple attempts');
        }
    }

    stop() {
        try {
            // Clear all intervals
            Object.values(this.intervals).forEach(interval => {
                if (interval) clearInterval(interval);
            });

            // Remove all UI elements
            const statusIndicator = document.querySelector('.nitro-status');
            if (statusIndicator) statusIndicator.remove();

            const captions = document.getElementsByClassName("NitroStreams-caption");
            Array.from(captions).forEach(caption => caption.remove());

            // Restore the original account type
            const currentUser = BdApi.findModuleByProps("getCurrentUser").getCurrentUser();
            if (currentUser) {
                currentUser.premiumType = this.old_account_type;
            }

            // Remove styles
            BdApi.clearCSS('DiscordNitroStyles');
        } catch (error) {
            console.error('Error during plugin cleanup:', error);
        }
    }
}

module.exports = DiscordNitro;