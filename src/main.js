/**
 * main.js — Logi Workspace (Desktop Suite v1.0)
 * Desktop Widescreen Workspace Entry Point
 */
import './style.css';
import { Architect } from './core/Architect.js';
import { State } from './core/State.js';
import { LogiNative } from './core/LogiNative.js';
import { SidebarNav } from './screens/sidebar/SidebarNav.js';
import { DesignerScreen } from './screens/designer/DesignerScreen.js';
import { CaptureScreen } from './screens/capture/CaptureScreen.js';
import { ProjectsScreen } from './screens/projects/ProjectsScreen.js';
import { ExportScreen } from './screens/export/ExportScreen.js';
import { SettingsScreen } from './screens/settings/SettingsScreen.js';

// Registrar Pantallas de Escritorio
Architect.register('designer', DesignerScreen);
Architect.register('capture', CaptureScreen);
Architect.register('projects', ProjectsScreen);
Architect.register('export', ExportScreen);
Architect.register('settings', SettingsScreen);

// Exponer funciones globales de carga (Loader)
window.showLoader = (title = 'Cargando Datos', desc = 'Procesando elementos, por favor espera...') => {
    const loader = document.getElementById('global-loader');
    const titleEl = document.getElementById('global-loader-title');
    const descEl = document.getElementById('global-loader-desc');
    if (loader) {
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = desc;
        loader.classList.remove('hidden');
    }
};

window.hideLoader = () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('>>> LOGI WORKSPACE (DESKTOP SUITE) INICIALIZADO <<<');

    await LogiNative.init();
    await State.loadFromDisk();

    const renderSidebar = () => {
        const sidebar = document.getElementById('sidebar-nav');
        if (sidebar) {
            sidebar.innerHTML = SidebarNav.render();
            SidebarNav.bindEvents();
        }
    };

    renderSidebar();
    Architect.render(State.currentTab || 'designer');

    State.subscribe((state, changeType) => {
        if (changeType === 'tab') {
            ExportScreen.assistantMode = false;
            ExportScreen.reportPhotos = [];
            renderSidebar();
            Architect.render(state.currentTab);
        }
    });
});
