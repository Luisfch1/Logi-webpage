/**
 * ExportScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Export Studio (Excel, PDF, CONTROL .lchp, ZIP Backup)
 */
import { State } from '../../core/State.js';

export const ExportScreen = {
    getLayout() {
        const proj = State.currentProject;
        const itemCount = State.items.length;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header Exportar -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Estación de Generación de Informes</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Exportación de Datos (${proj?.name || 'PROYECTO'})</h1>
                    </div>
                    <span class="text-xs font-mono text-white/50">${itemCount} Evidencias Registradas</span>
                </div>

                <!-- Opciones de Exportación Desktop -->
                <div class="grid grid-cols-3 gap-6">
                    <!-- Excel -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-all">
                        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <span class="material-symbols-outlined text-2xl">table_chart</span>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Reporte Excel (.xlsx)</h3>
                            <p class="text-xs text-white/40 mt-1">Exporta la tabla completa de ítems con sus descripciones, fechas e hipervínculos.</p>
                        </div>
                        <button id="btn-export-excel" class="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all">
                            Exportar Excel
                        </button>
                    </div>

                    <!-- PDF -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-4 hover:border-rose-500/50 transition-all">
                        <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Informe PDF Imprimible</h3>
                            <p class="text-xs text-white/40 mt-1">Genera documento maquetado con fotografías y metadatos de obra.</p>
                        </div>
                        <button id="btn-export-pdf" class="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all">
                            Generar PDF
                        </button>
                    </div>

                    <!-- Respaldo ZIP -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-4 hover:border-primary/50 transition-all">
                        <div class="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                            <span class="material-symbols-outlined text-2xl">folder_zip</span>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Respaldo de Proyecto (.zip)</h3>
                            <p class="text-xs text-white/40 mt-1">Empaqueta fotos originales y metadatos en un archivo comprimido.</p>
                        </div>
                        <button id="btn-export-zip" class="w-full py-2.5 rounded-xl bg-primary text-black font-bold text-xs glow-border transition-all">
                            Descargar Respaldo .zip
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const btnZip = document.getElementById('btn-export-zip');
        if (btnZip) {
            btnZip.onclick = () => alert("Generando archivo ZIP de respaldo...");
        }

        const btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) {
            btnExcel.onclick = () => alert("Exportando datos a Excel...");
        }

        const btnPdf = document.getElementById('btn-export-pdf');
        if (btnPdf) {
            btnPdf.onclick = () => alert("Generando PDF imprimible...");
        }
    }
};
