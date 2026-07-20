/**
 * SidebarNav.js
 * Barra de Navegación Lateral Fija Panorámica para Logi Workspace (Desktop)
 */
export const SidebarNav = {
    render() {
        return `
            <div class="flex flex-col h-full justify-between">
                <!-- Marca & Header -->
                <div class="space-y-8">
                    <div class="flex items-center gap-3 px-2">
                        <div class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-border">
                            <span class="material-symbols-outlined text-primary text-xl">token</span>
                        </div>
                        <div>
                            <h1 class="font-headline font-black tracking-wider text-base text-white uppercase">LOGI<span class="text-primary">STUDIO</span></h1>
                            <p class="text-[9px] font-mono tracking-widest text-white/40 uppercase">WORKSPACE V1.0</p>
                        </div>
                    </div>

                    <!-- Menú de Navegación Panorámico -->
                    <nav class="space-y-1.5">
                        <button id="nav-designer" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-black bg-primary glow-border">
                            <span class="material-symbols-outlined text-lg">design_services</span>
                            <span>Diseñador .logifmt</span>
                        </button>

                        <button id="nav-projects" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                            <span class="material-symbols-outlined text-lg">folder_open</span>
                            <span>Gestión de Proyectos</span>
                        </button>

                        <button id="nav-templates" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                            <span class="material-symbols-outlined text-lg">grid_view</span>
                            <span>Catálogo de Plantillas</span>
                        </button>

                        <button id="nav-reports" class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                            <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
                            <span>Renderizador PDF / Excel</span>
                        </button>
                    </nav>
                </div>

                <!-- Footer / Perfil -->
                <div class="pt-4 border-t border-white/5 space-y-3">
                    <div class="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5">
                        <div class="flex items-center gap-2.5 overflow-hidden">
                            <div class="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                JS
                            </div>
                            <div class="truncate">
                                <p class="text-[11px] font-bold text-white truncate">Inspector Pro</p>
                                <p class="text-[9px] text-white/40 font-mono">Modo Offline / Local</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
