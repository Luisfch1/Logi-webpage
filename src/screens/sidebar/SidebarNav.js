/**
 * SidebarNav.js — Logi Workspace (Desktop Suite)
 * Panorámica Fija de Escritorio con todos los módulos adaptados
 */
import { State } from '../../core/State.js';
import { Architect } from '../../core/Architect.js';
import logoUrl from '../../logo.jpg';

export const SidebarNav = {
    render() {
        const activeTab = State.currentTab;

        const navItem = (id, icon, label) => {
            const isActive = activeTab === id;
            return `
                <button id="nav-${id}" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border ${isActive ? 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_12px_rgba(202,253,0,0.05)]' : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'}" data-tab="${id}">
                    <span class="material-symbols-outlined text-lg">${icon}</span>
                    <span>${label}</span>
                </button>
            `;
        };

        return `
            <div class="flex flex-col h-full justify-between">
                <!-- Marca & Header -->
                <div class="space-y-8">
                    <div class="flex items-center gap-3 px-2">
                        <img src="${logoUrl}" class="w-9 h-9 rounded-xl border border-white/10 glow-border object-cover select-none pointer-events-none" alt="LogiStudio Logo" />
                        <div>
                            <h1 class="font-headline font-black tracking-wider text-base text-white uppercase">LOGI<span class="text-primary">STUDIO</span></h1>
                            <p class="text-[9px] font-mono tracking-widest text-white/40 uppercase">WORKSPACE V1.0</p>
                        </div>
                    </div>

                    <!-- Menú de Navegación Panorámico de Escritorio -->
                    <nav class="space-y-1.5">
                        ${navItem('projects', 'folder_open', 'Gestión de Proyectos')}
                        ${navItem('capture', 'photo_camera', 'Captura de Evidencias')}
                        ${navItem('export', 'output', 'Exportar PDF / Excel')}
                        ${navItem('settings', 'settings', 'Configuración')}
                        ${navItem('designer', 'design_services', 'Diseñador .logifmt')}
                    </nav>
                </div>

                <!-- Footer / Perfil -->
                <div class="pt-4 border-t border-white/5 space-y-3">
                    <div class="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
                        <div class="flex items-center gap-2.5 overflow-hidden">
                            <div class="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                LOGI
                            </div>
                            <div class="truncate">
                                <p class="text-[11px] font-bold text-white truncate">Estación de Trabajo</p>
                                <p class="text-[9px] text-white/40 font-mono">PC Desktop Suite</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        document.querySelectorAll('aside button[data-tab]').forEach(btn => {
            btn.onclick = () => {
                const tab = btn.dataset.tab;
                State.setTab(tab);
            };
        });
    }
};
