/**
 * SettingsScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Settings & Data Management Workspace
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';

export const SettingsScreen = {
    getLayout() {
        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header Configuración -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Configuración General · PC Desktop</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Ajustes de la Suite</h1>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-8 overflow-y-auto">
                    <!-- Apariencia -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-5">
                        <h3 class="font-headline text-xs font-bold text-white uppercase tracking-widest">Apariencia y Colores de Acento</h3>
                        
                        <div class="space-y-3">
                            <label class="text-xs text-white/70 block">Color de Acento de la Interfaz</label>
                            <div class="flex gap-4">
                                <button data-color="#1e90ff" class="btn-color-dot w-8 h-8 rounded-full bg-[#1e90ff] active:scale-95 transition-all"></button>
                                <button data-color="#00ffff" class="btn-color-dot w-8 h-8 rounded-full bg-[#00ffff] active:scale-95 transition-all"></button>
                                <button data-color="#cafd00" class="btn-color-dot w-8 h-8 rounded-full bg-[#cafd00] active:scale-95 transition-all"></button>
                                <button data-color="#8a2be2" class="btn-color-dot w-8 h-8 rounded-full bg-[#8a2be2] active:scale-95 transition-all"></button>
                                <button data-color="#ff6d00" class="btn-color-dot w-8 h-8 rounded-full bg-[#ff6d00] active:scale-95 transition-all"></button>
                                <button data-color="#ff1493" class="btn-color-dot w-8 h-8 rounded-full bg-[#ff1493] active:scale-95 transition-all"></button>
                            </div>
                        </div>
                    </div>

                    <!-- Gestión de Ítems / Catálogo -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-5">
                        <h3 class="font-headline text-xs font-bold text-white uppercase tracking-widest">Catálogo de Ítems del Proyecto</h3>
                        <p class="text-xs text-white/50">Carga la lista de actividades desde un archivo Excel o CSV.</p>
                        
                        <div class="flex gap-3">
                            <button id="btn-upload-catalog-pc" class="px-4 py-2.5 bg-primary text-black font-bold text-xs rounded-xl glow-border">
                                Cargar Catálogo (Excel/CSV)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.btn-color-dot').forEach(btn => {
            btn.onclick = () => {
                State.setAccentColor(btn.dataset.color);
            };
        });

        const btnCatalog = document.getElementById('btn-upload-catalog-pc');
        if (btnCatalog) {
            btnCatalog.onclick = () => alert("Selecciona un archivo Excel o CSV con el listado de ítems.");
        }
    }
};
