/**
 * ExportScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Export Studio (Excel, PDF, CONTROL .lchp, ZIP Backup)
 */
import JSZip from 'jszip';
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';

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

                <!-- Filtros de Fecha (Compartido para exportación) -->
                <div class="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-end">
                    <div class="w-full md:w-48 shrink-0">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5 font-headline">Modo de Rango</label>
                        <select id="export-select-mode" class="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none font-body">
                            <option value="todo">Todo el Proyecto</option>
                            <option value="dia">Día Específico</option>
                            <option value="mes">Mes Específico</option>
                            <option value="rango">Rango de Fechas</option>
                        </select>
                    </div>

                    <div id="export-date-day-box" class="w-full md:w-48 hidden">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5 font-headline">Fecha Específica</label>
                        <input id="export-date-day" type="date" class="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none font-body" />
                    </div>

                    <div id="export-date-month-box" class="w-full md:w-48 hidden">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5 font-headline">Mes</label>
                        <input id="export-date-month" type="month" class="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none font-body" />
                    </div>

                    <div id="export-date-range-box" class="w-full flex gap-4 hidden">
                        <div class="w-full md:w-48">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5 font-headline">Fecha Inicio</label>
                            <input id="export-date-start" type="date" class="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none font-body" />
                        </div>
                        <div class="w-full md:w-48">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5 font-headline">Fecha Fin</label>
                            <input id="export-date-end" type="date" class="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none font-body" />
                        </div>
                    </div>
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
                            <h3 class="text-base font-bold text-white">Respaldo ZIP de Fotos</h3>
                            <p class="text-xs text-white/40 mt-1">Empaqueta las fotos filtradas por fecha organizadas en carpetas diarias.</p>
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
        // Inicializar inputs de fecha con valores por defecto
        const todayStr = new Date().toISOString().split('T')[0];
        const monthStr = new Date().toISOString().split('T')[0].substring(0, 7);

        const dateDay = document.getElementById('export-date-day');
        if (dateDay) dateDay.value = todayStr;

        const dateMonth = document.getElementById('export-date-month');
        if (dateMonth) dateMonth.value = monthStr;

        const dateStart = document.getElementById('export-date-start');
        if (dateStart) dateStart.value = todayStr;

        const dateEnd = document.getElementById('export-date-end');
        if (dateEnd) dateEnd.value = todayStr;

        this.bindEvents();
    },

    bindEvents() {
        const selectMode = document.getElementById('export-select-mode');
        const boxDay = document.getElementById('export-date-day-box');
        const boxMonth = document.getElementById('export-date-month-box');
        const boxRange = document.getElementById('export-date-range-box');

        const updateVisibility = () => {
            if (!selectMode) return;
            const val = selectMode.value;
            if (boxDay) boxDay.classList.toggle('hidden', val !== 'dia');
            if (boxMonth) boxMonth.classList.toggle('hidden', val !== 'mes');
            if (boxRange) boxRange.classList.toggle('hidden', val !== 'rango');
        };

        if (selectMode) {
            selectMode.onchange = updateVisibility;
            updateVisibility();
        }

        const btnZip = document.getElementById('btn-export-zip');
        if (btnZip) {
            btnZip.onclick = () => this.exportZip();
        }

        const btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) {
            btnExcel.onclick = () => alert("Exportando datos a Excel...");
        }

        const btnPdf = document.getElementById('btn-export-pdf');
        if (btnPdf) {
            btnPdf.onclick = () => alert("Generando PDF imprimible...");
        }
    },

    getFilteredPhotos() {
        const mode = document.getElementById('export-select-mode')?.value || 'todo';
        const projectPhotos = State.items || [];

        const getLocalDateStr = (timestamp) => {
            if (!timestamp) return "";
            const d = new Date(timestamp);
            if (isNaN(d.getTime())) return "";
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const r = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${r}`;
        };

        if (mode === 'todo') {
            return projectPhotos;
        } else if (mode === 'dia') {
            const target = document.getElementById('export-date-day')?.value; // YYYY-MM-DD
            if (!target) return projectPhotos;
            return projectPhotos.filter(p => getLocalDateStr(p.createdAt) === target);
        } else if (mode === 'mes') {
            const target = document.getElementById('export-date-month')?.value; // YYYY-MM
            if (!target) return projectPhotos;
            return projectPhotos.filter(p => getLocalDateStr(p.createdAt).startsWith(target));
        } else if (mode === 'rango') {
            const start = document.getElementById('export-date-start')?.value;
            const end = document.getElementById('export-date-end')?.value;
            if (!start || !end) return projectPhotos;
            return projectPhotos.filter(p => {
                const ds = getLocalDateStr(p.createdAt);
                return ds >= start && ds <= end;
            });
        }
        return projectPhotos;
    },

    async exportZip() {
        const proj = State.currentProject;
        if (!proj) {
            alert("No hay un proyecto activo seleccionado.");
            return;
        }

        const filtered = this.getFilteredPhotos();
        if (filtered.length === 0) {
            alert("No hay evidencias que coincidan con las fechas seleccionadas.");
            return;
        }

        console.log(`[ExportScreen] Generando ZIP con ${filtered.length} evidencias...`);

        try {
            const zip = new JSZip();

            // Agrupar por fecha local (YYYY-MM-DD)
            const groups = {};
            filtered.forEach(photo => {
                const d = new Date(photo.createdAt || Date.now());
                const dateStr = d.toISOString().split('T')[0];
                if (!groups[dateStr]) groups[dateStr] = [];
                groups[dateStr].push(photo);
            });

            const dates = Object.keys(groups).sort();
            let processedCount = 0;
            const totalCount = filtered.length;

            for (const dateStr of dates) {
                const folder = zip.folder(dateStr);
                const photosInDate = groups[dateStr];

                for (let i = 0; i < photosInDate.length; i++) {
                    const photo = photosInDate[i];
                    processedCount++;

                    // Obtener los bytes de la foto desde IndexedDB
                    const base64Data = await LogiNative.readBlobAsBase64(photo.filename);
                    if (base64Data) {
                        const rawBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
                        folder.file(photo.filename, rawBase64, { base64: true });
                    }
                }
            }

            console.log("[ExportScreen] Generando archivo ZIP en navegador...");
            const content = await zip.generateAsync({ type: "blob" });

            const cleanProjName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const baseFileName = `fotos_${cleanProjName}_${Date.now()}.zip`;

            // Descargar archivo en navegador
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = baseFileName;
            a.click();
            URL.revokeObjectURL(url);

            alert(`¡ZIP generado con éxito! Descargado: ${baseFileName} (${totalCount} fotos)`);
        } catch (err) {
            console.error("ZIP Export Error:", err);
            alert("Error al generar el ZIP: " + err.message);
        }
    }
};
