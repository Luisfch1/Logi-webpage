/**
 * Architect.js
 * Motor de Renderizado de Pantallas Modular para Logi Workspace (Desktop Suite)
 */
export const Architect = {
    screens: {},
    activeScreenId: null,

    register(id, screenModule) {
        this.screens[id] = screenModule;
    },

    render(id, containerId = 'workspace-viewport') {
        const screen = this.screens[id];
        if (!screen) {
            console.error(`[Architect] Pantalla no encontrada: ${id}`);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        this.activeScreenId = id;
        container.innerHTML = screen.getLayout();

        if (typeof screen.init === 'function') {
            setTimeout(() => screen.init(), 0);
        }
    }
};
