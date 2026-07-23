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
            <div class="flex flex-col h-full w-full overflow-hidden p-5 space-y-4">
                <!-- Header Exportar -->
                <div class="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <div>
                        <span class="text-[9px] font-bold font-headline uppercase tracking-widest text-primary">Estación de Generación de Informes</span>
                        <h1 class="text-xl font-bold font-headline text-white">Informes y Respaldos</h1>
                    </div>
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
            btnPdf.onclick = () => this.exportPdf();
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

    async exportPdf() {
        const proj = State.currentProject;
        if (!proj) {
            alert("No hay un proyecto activo seleccionado.");
            return;
        }

        const filtered = this.getFilteredPhotos();
        if (filtered.length === 0) {
            alert("No hay evidencias que coincidan con los filtros de fecha seleccionados.");
            return;
        }

        if (filtered.length > 200) {
            if (!confirm(`Vas a generar un reporte PDF con ${filtered.length} evidencias. Esto puede tomar unos momentos y consumir recursos. ¿Deseas continuar?`)) {
                return;
            }
        }

        window.showLoader("Generando Reporte", "Cargando metadatos y fotos de IndexedDB...");

        try {
            const logoB64 = await LogiNative.getLogo();
            const logoHtml = logoB64 ? `<img class="header-logo" src="${logoB64}" alt="Logo" />` : `
                <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 22px; color: #000; display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--primary, #cafd00); text-shadow: 0 0 2px rgba(0,0,0,0.2)">L</span>OGI<span style="color: var(--primary, #cafd00)">STUDIO</span>
                </div>
            `;

            let photoCardsHtml = '';
            for (let i = 0; i < filtered.length; i++) {
                const photo = filtered[i];
                const base64Data = await LogiNative.readBlobAsBase64(photo.filename);
                
                const catalogItem = State.catalog?.find(c => String(c.item).toUpperCase() === (photo.actividad || '').toUpperCase());
                const catalogDesc = catalogItem ? catalogItem.descripcion : '';
                const displayDesc = photo.descripcion || catalogDesc || 'Sin descripción';
                const timeStr = photo.timeStr || new Date(photo.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                const dateStr = photo.fechaStr || new Date(photo.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                
                photoCardsHtml += `
                    <div class="photo-card" style="page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column; height: 350px;">
                        <div class="photo-img-box" style="width: 100%; height: 230px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e2e8f0;">
                            <img class="photo-img" src="${base64Data || ''}" alt="Evidencia" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                        <div class="photo-details" style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px;">
                            <div class="photo-act-time" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 6px;">
                                <span class="photo-act" style="font-weight: 700; color: #000; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${photo.actividad || 'GENERAL'}</span>
                                <span class="photo-time" style="color: #64748b; font-size: 10px;">${dateStr} ${timeStr}</span>
                            </div>
                            <p class="photo-desc" style="color: #334155; line-height: 1.4; margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; font-family: sans-serif;">${displayDesc}</p>
                        </div>
                    </div>
                `;
            }

            const selectMode = document.getElementById('export-select-mode');
            const mode = selectMode ? selectMode.value : 'todo';
            let filterText = 'Todo el Proyecto';
            if (mode === 'dia') {
                filterText = `Día específico (${document.getElementById('export-date-day')?.value || ''})`;
            } else if (mode === 'mes') {
                filterText = `Mes específico (${document.getElementById('export-date-month')?.value || ''})`;
            } else if (mode === 'rango') {
                filterText = `Rango (${document.getElementById('export-date-start')?.value || ''} al ${document.getElementById('export-date-end')?.value || ''})`;
            }

            const reportDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert("El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.");
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reporte de Evidencias - ${proj.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                        body {
                            font-family: 'Inter', sans-serif;
                            color: #1e293b;
                            margin: 0;
                            padding: 0;
                            background: #fff;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 2px solid #cafd00;
                            padding-bottom: 12px;
                            margin-bottom: 20px;
                        }
                        .header-logo {
                            max-height: 45px;
                            max-width: 140px;
                            object-fit: contain;
                        }
                        .header-title-box {
                            text-align: right;
                        }
                        .header-title {
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 18px;
                            font-weight: 700;
                            margin: 0;
                            color: #0f172a;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .header-subtitle {
                            font-size: 10px;
                            color: #64748b;
                            margin: 2px 0 0 0;
                        }
                        .meta-grid {
                            display: grid;
                            grid-template-cols: repeat(4, 1fr);
                            gap: 12px;
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            padding: 10px 14px;
                            border-radius: 8px;
                            font-size: 11px;
                            margin-bottom: 25px;
                        }
                        .meta-item strong {
                            display: block;
                            color: #64748b;
                            text-transform: uppercase;
                            font-size: 8px;
                            letter-spacing: 0.5px;
                            margin-bottom: 2px;
                        }
                        .grid-photos {
                            display: grid;
                            grid-template-cols: 1fr 1fr;
                            gap: 20px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .grid-photos {
                                gap: 15px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            ${logoHtml}
                        </div>
                        <div class="header-title-box">
                            <h1 class="header-title">Reporte de Evidencias Fotográficas</h1>
                            <p class="header-subtitle">Generado automáticamente por LogiStudio Workspace</p>
                        </div>
                    </div>
                    
                    <div class="meta-grid">
                        <div class="meta-item">
                            <strong>Proyecto</strong>
                            <span style="font-weight: 600; color: #0f172a;">${proj.name.toUpperCase()}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Fecha de Reporte</strong>
                            <span>${reportDate}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Filtro Aplicado</strong>
                            <span>${filterText}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Total Evidencias</strong>
                            <span style="font-weight: 600; color: #0f172a;">${filtered.length}</span>
                        </div>
                    </div>

                    <div class="grid-photos">
                        ${photoCardsHtml}
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error("[ExportScreen] Error al generar PDF:", err);
            alert("Error al generar el PDF: " + err.message);
        } finally {
            window.hideLoader();
        }
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
