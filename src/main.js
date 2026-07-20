/**
 * main.js
 * Logi Workspace (Desktop Suite) Entry Point
 */
import './style.css';
import { Architect } from './core/Architect.js';
import { State } from './core/State.js';
import { SidebarNav } from './screens/sidebar/SidebarNav.js';
import { DesignerScreen } from './screens/designer/DesignerScreen.js';

// Registrar pantallas
Architect.register('designer', DesignerScreen);

document.addEventListener('DOMContentLoaded', () => {
    console.log('>>> LOGI WORKSPACE INICIALIZADO (DESKTOP SUITE) <<<');

    // Renderizar Sidebar panorámico
    const sidebar = document.getElementById('sidebar-nav');
    if (sidebar) {
        sidebar.innerHTML = SidebarNav.render();
    }

    // Renderizar pantalla principal inicial (Diseñador .logifmt)
    Architect.render('designer');
});
