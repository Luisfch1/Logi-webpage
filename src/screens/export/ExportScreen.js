/**
 * ExportScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Export Studio (Excel, PDF, CONTROL .lchp, ZIP Backup)
 */
import JSZip from 'jszip';
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';
import { Architect } from '../../core/Architect.js';

export const ExportScreen = {
    assistantMode: false,
    reportPhotos: [],

    getLayout() {
        if (this.assistantMode) {
            return this.getAssistantLayout();
        }
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

                    <!-- PDF / Word Assistant -->
                    <div class="p-6 bg-[#0a0a0c] border border-white/10 rounded-2xl space-y-4 hover:border-rose-500/50 transition-all">
                        <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-white">Generador de Informes (PDF / Word)</h3>
                            <p class="text-xs text-white/40 mt-1">Configura, previsualiza y edita la selección de evidencias antes de generar tu reporte PDF o Word editable.</p>
                        </div>
                        <button id="btn-start-assistant" class="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all">
                            Iniciar Asistente
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
        if (this.assistantMode) {
            this.bindAssistantEvents();
            return;
        }

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
        if (this.assistantMode) {
            this.bindAssistantEvents();
            return;
        }

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

        const btnStartAssistant = document.getElementById('btn-start-assistant');
        if (btnStartAssistant) {
            btnStartAssistant.onclick = () => {
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
                this.reportPhotos = [...filtered];
                this.assistantMode = true;
                Architect.render('export');
            };
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

    getAssistantLayout() {
        const catalog = State.catalog || [];
        
        const photosGridHtml = this.reportPhotos.length === 0 ? `
            <div class="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-3 bg-black/20">
                <span class="material-symbols-outlined text-4xl text-white/20">photo_library</span>
                <p class="text-sm font-bold text-white/60">No hay fotos en este reporte</p>
                <p class="text-xs text-white/40 max-w-sm mx-auto">Excluiste todas las fotos o el rango seleccionado no tiene evidencias. Vuelve atrás para reconfigurar.</p>
            </div>
        ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                ${this.reportPhotos.map((photo, index) => {
                    const catalogItem = catalog.find(c => String(c.item).toUpperCase() === (photo.actividad || '').toUpperCase());
                    const catalogDesc = catalogItem ? catalogItem.descripcion : '';
                    const displayDesc = photo.descripcion || catalogDesc || 'Sin descripción';
                    
                    return `
                        <div class="relative flex flex-col bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden group hover:border-primary/30 transition-all h-[280px]">
                            <!-- Header de Tarjeta (Número de Foto) -->
                            <div class="flex justify-between items-center bg-black/40 px-3 py-1.5 border-b border-white/5 font-mono text-[10px] text-white/60">
                                <span class="font-bold text-primary">FOTO #${index + 1}</span>
                                <span>${photo.fechaStr || ''}</span>
                            </div>

                            <!-- Imagen -->
                            <div class="relative flex-1 bg-black/20 overflow-hidden flex items-center justify-center">
                                <img id="assistant-img-${photo.id}" class="w-full h-full object-cover lazy-assistant-thumb" data-id="${photo.id}" data-filename="${photo.filename}" src="${photo._tempImageSrc || ''}" alt="Evidencia" />
                                
                                <!-- Botón de Excluir Flotante (Se muestra al hacer Hover) -->
                                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                                    <button class="btn-assistant-exclude px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer pointer-events-auto active:scale-95 transition-all shadow-lg" data-index="${index}" title="Quitar de este reporte">
                                        <span class="material-symbols-outlined text-xs">close</span>
                                        <span>Excluir del Reporte</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Detalles de Pie de Tarjeta -->
                            <div class="p-2.5 bg-black/20 border-t border-white/5 space-y-1 select-none">
                                <div class="flex justify-between items-center gap-2">
                                    <span class="text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.5 rounded truncate max-w-[80px]">${photo.actividad || 'GENERAL'}</span>
                                    <span class="text-[8px] font-mono text-white/40">${photo.timeStr || ''}</span>
                                </div>
                                <p class="text-[10px] text-white/70 truncate leading-tight font-body" title="${displayDesc}">${displayDesc}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-5 space-y-4">
                <!-- Header del Asistente -->
                <div class="flex justify-between items-center border-b border-white/10 pb-2.5 shrink-0">
                    <div>
                        <span class="text-[9px] font-bold font-headline uppercase tracking-widest text-primary">LogiStudio Report Wizard</span>
                        <h1 class="text-xl font-bold font-headline text-white">Asistente de Configuración de Informe</h1>
                    </div>
                    
                    <button id="btn-assistant-back" class="px-3.5 py-2 rounded-xl border border-white/15 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Volver al Configurador</span>
                    </button>
                </div>

                <!-- Barra de Acciones del Asistente -->
                <div class="flex justify-between items-center bg-[#0a0a0c] border border-white/10 px-4 py-3 rounded-xl shrink-0 gap-4">
                    <div class="flex items-center gap-2.5 font-mono text-xs text-white/60">
                        <span class="material-symbols-outlined text-primary text-base">info</span>
                        <span>Evidencias en reporte: <strong class="text-primary text-sm" id="txt-assistant-count">${this.reportPhotos.length}</strong></span>
                        <span class="text-white/20">|</span>
                        <span class="text-[10px]">Excluir fotos re-organiza y re-enumera todo automáticamente.</span>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button id="btn-assistant-pdf" class="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-base">picture_as_pdf</span>
                            <span>Generar PDF Final</span>
                        </button>
                        
                        <button id="btn-assistant-word" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-base">description</span>
                            <span>Generar Word Editable</span>
                        </button>
                    </div>
                </div>

                <!-- Lista Editable de Evidencias (Scrollable) -->
                <div class="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                    ${photosGridHtml}
                </div>
            </div>
        `;
    },

    bindAssistantEvents() {
        const btnBack = document.getElementById('btn-assistant-back');
        if (btnBack) {
            btnBack.onclick = () => {
                this.assistantMode = false;
                Architect.render('export');
            };
        }

        const btnPdf = document.getElementById('btn-assistant-pdf');
        if (btnPdf) {
            btnPdf.onclick = () => this.generatePdfFromAssistant();
        }

        const btnWord = document.getElementById('btn-assistant-word');
        if (btnWord) {
            btnWord.onclick = () => this.generateWordFromAssistant();
        }

        document.querySelectorAll('.btn-assistant-exclude').forEach(btn => {
            btn.onclick = () => {
                const index = parseInt(btn.dataset.index, 10);
                if (!isNaN(index)) {
                    this.reportPhotos.splice(index, 1);
                    Architect.render('export');
                }
            };
        });

        const container = document.querySelector('.lazy-assistant-thumb')?.closest('.overflow-y-auto');
        if (container) {
            const lazyImages = container.querySelectorAll('.lazy-assistant-thumb');
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const id = img.dataset.id;
                        const filename = img.dataset.filename;
                        const it = this.reportPhotos.find(item => item.id === id);
                        if (it) {
                            if (it._tempImageSrc) {
                                img.src = it._tempImageSrc;
                            } else {
                                const uri = await LogiNative.getBlobUri(filename);
                                if (uri) {
                                    it._tempImageSrc = uri;
                                    img.src = uri;
                                }
                            }
                        }
                        obs.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px 200px 0px',
                threshold: 0.01
            });

            lazyImages.forEach(img => {
                const id = img.dataset.id;
                const it = this.reportPhotos.find(item => item.id === id);
                if (it && it._tempImageSrc) {
                    img.src = it._tempImageSrc;
                } else {
                    observer.observe(img);
                }
            });
        }
    },

    async generatePdfFromAssistant() {
        const proj = State.currentProject;
        if (!proj) return;

        if (this.reportPhotos.length === 0) {
            alert("No hay fotos seleccionadas para exportar.");
            return;
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
            for (let i = 0; i < this.reportPhotos.length; i++) {
                const photo = this.reportPhotos[i];
                const base64Data = await LogiNative.readBlobAsBase64(photo.filename);
                
                const catalogItem = State.catalog?.find(c => String(c.item).toUpperCase() === (photo.actividad || '').toUpperCase());
                const catalogDesc = catalogItem ? catalogItem.descripcion : '';
                const displayDesc = photo.descripcion || catalogDesc || '';
                
                const isGeneral = !photo.actividad || String(photo.actividad).trim().toUpperCase() === 'GENERAL';
                const hasAct = !isGeneral;
                const hasDesc = !!displayDesc;

                let detailsHtml = '';
                if (hasAct || hasDesc) {
                    detailsHtml = `
                        <div class="photo-details" style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; font-size: 11px;">
                            ${hasAct ? `
                                <div class="photo-act-time" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 6px;">
                                    <span class="photo-act" style="font-weight: 700; color: #000; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${photo.actividad}</span>
                                </div>
                            ` : ''}
                            ${hasDesc ? `
                                <p class="photo-desc" style="color: #334155; line-height: 1.4; margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; font-family: sans-serif;">${displayDesc}</p>
                            ` : ''}
                        </div>
                    `;
                }

                photoCardsHtml += `
                    <div class="photo-card" style="page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; display: flex; flex-direction: column; height: 380px;">
                        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 6px 12px; font-size: 11px; font-weight: bold; color: #64748b; font-family: sans-serif;">
                            FOTO #${i + 1}
                        </div>
                        <div class="photo-img-box" style="width: 100%; height: 230px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e2e8f0;">
                            <img class="photo-img" src="${base64Data || ''}" alt="Evidencia" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                        ${detailsHtml}
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
                    <title> </title>
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
                            font-size: 16px;
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
                            grid-template-columns: repeat(4, 1fr);
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
                            grid-template-columns: 1fr 1fr;
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
                            <h1 class="header-title">Reporte de Evidencias Fotográficas - ${proj.name.toUpperCase()}</h1>
                            <p class="header-subtitle">Generado automáticamente por LogiStudio</p>
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
                            <span style="font-weight: 600; color: #0f172a;">${this.reportPhotos.length}</span>
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

    async generateWordFromAssistant() {
        const proj = State.currentProject;
        if (!proj) return;

        if (this.reportPhotos.length === 0) {
            alert("No hay fotos seleccionadas para exportar.");
            return;
        }

        window.showLoader("Generando Word", "Construyendo documento editable...");

        try {
            const boundary = "----=_NextPart_LogiStudio_Workspace_Boundary";
            const logoB64 = await LogiNative.getLogo();
            
            const hasLogo = !!logoB64;
            const logoHtml = hasLogo ? `<img src="cid:logo" width="120" style="object-fit:contain;" />` : `
                <div style="font-family: Arial, sans-serif; font-weight: bold; font-size: 20px; color: #000;">
                    LOGISTUDIO
                </div>
            `;

            const escapeHtml = (str) => {
                if (!str) return '';
                return String(str)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;")
                    .replace(/á/g, "&aacute;")
                    .replace(/é/g, "&eacute;")
                    .replace(/í/g, "&iacute;")
                    .replace(/ó/g, "&oacute;")
                    .replace(/ú/g, "&uacute;")
                    .replace(/ñ/g, "&ntilde;")
                    .replace(/Á/g, "&Aacute;")
                    .replace(/É/g, "&Eacute;")
                    .replace(/Í/g, "&Iacute;")
                    .replace(/Ó/g, "&Oacute;")
                    .replace(/Ú/g, "&Uacute;")
                    .replace(/Ñ/g, "&Ntilde;");
            };

            const reportDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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

            // Agrupar fotos en pares para maquetar 2 columnas nativas en una sola tabla en Word (sin tablas anidadas)
            let rowsHtml = '';
            const photoEmbeds = [];

            const registerPhoto = async (photo) => {
                if (!photo) return;
                const base64Data = await LogiNative.readBlobAsBase64(photo.filename);
                if (base64Data) {
                    const rawBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
                    const mimeType = base64Data.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
                    photoEmbeds.push({
                        cid: `photo_${photo.id}`,
                        mime: mimeType,
                        data: rawBase64
                    });
                }
            };

            for (let i = 0; i < this.reportPhotos.length; i += 2) {
                const photo1 = this.reportPhotos[i];
                const photo2 = this.reportPhotos[i + 1];

                await registerPhoto(photo1);
                if (photo2) {
                    await registerPhoto(photo2);
                }

                const card1Num = i + 1;
                const card2Num = i + 2;

                // Photo 1 Details
                const catalogItem1 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo1.actividad || '').toUpperCase());
                const catalogDesc1 = catalogItem1 ? catalogItem1.descripcion : '';
                const displayDesc1 = photo1.descripcion || catalogDesc1 || '';
                
                const isGeneral1 = !photo1.actividad || String(photo1.actividad).trim().toUpperCase() === 'GENERAL';
                const hasAct1 = !isGeneral1;
                const hasDesc1 = !!displayDesc1;

                // Photo 2 Details
                let hasAct2 = false;
                let hasDesc2 = false;
                let displayDesc2 = '';
                if (photo2) {
                    const catalogItem2 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo2.actividad || '').toUpperCase());
                    const catalogDesc2 = catalogItem2 ? catalogItem2.descripcion : '';
                    displayDesc2 = photo2.descripcion || catalogDesc2 || '';
                    
                    const isGeneral2 = !photo2.actividad || String(photo2.actividad).trim().toUpperCase() === 'GENERAL';
                    hasAct2 = !isGeneral2;
                    hasDesc2 = !!displayDesc2;
                }

                // 1. Fila de Cabecera (FOTO #num)
                rowsHtml += `
                    <tr>
                        <td style="width: 48%; background-color: #f8fafc; border-top: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 6px 12px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; font-weight: bold; color: #64748b;">
                            FOTO #${card1Num}
                        </td>
                        <td style="width: 4%;"></td>
                        <td style="width: 48%; background-color: ${photo2 ? '#f8fafc' : 'transparent'}; border-top: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: 6px 12px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; font-weight: bold; color: #64748b;">
                            ${photo2 ? `FOTO #${card2Num}` : ''}
                        </td>
                    </tr>
                `;

                // 2. Fila de Imagen
                rowsHtml += `
                    <tr>
                        <td align="center" style="width: 48%; background-color: #ffffff; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 10px; vertical-align: middle;">
                            <img src="cid:photo_${photo1.id}" width="280" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />
                        </td>
                        <td style="width: 4%;"></td>
                        <td align="center" style="width: 48%; background-color: ${photo2 ? '#ffffff' : 'transparent'}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: 10px; vertical-align: middle;">
                            ${photo2 ? `<img src="cid:photo_${photo2.id}" width="280" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />` : ''}
                        </td>
                    </tr>
                `;

                // 3. Fila de Detalles
                const borderBottom1 = '1px solid #cbd5e1';
                const borderBottom2 = photo2 ? '1px solid #cbd5e1' : '0';

                const detailsContent1 = `
                    ${hasAct1 ? `
                        <div style="margin-bottom: 6px;">
                            <span style="font-weight: bold; color: #000000; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: Courier New, monospace; font-size: 8pt;">${escapeHtml(photo1.actividad)}</span>
                        </div>
                    ` : ''}
                    <p style="color: #334155; line-height: 1.4; margin: 0; font-family: Calibri, Arial, sans-serif; font-size: 8.5pt;">${hasDesc1 ? escapeHtml(displayDesc1) : '&nbsp;'}</p>
                `;

                const detailsContent2 = photo2 ? `
                    ${hasAct2 ? `
                        <div style="margin-bottom: 6px;">
                            <span style="font-weight: bold; color: #000000; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: Courier New, monospace; font-size: 8pt;">${escapeHtml(photo2.actividad)}</span>
                        </div>
                    ` : ''}
                    <p style="color: #334155; line-height: 1.4; margin: 0; font-family: Calibri, Arial, sans-serif; font-size: 8.5pt;">${hasDesc2 ? escapeHtml(displayDesc2) : '&nbsp;'}</p>
                ` : '';

                rowsHtml += `
                    <tr>
                        <td style="width: 48%; background-color: #ffffff; border-bottom: ${borderBottom1}; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 12px; font-size: 9pt; vertical-align: top;">
                            ${detailsContent1}
                        </td>
                        <td style="width: 4%;"></td>
                        <td style="width: 48%; background-color: ${photo2 ? '#ffffff' : 'transparent'}; border-bottom: ${borderBottom2}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: ${photo2 ? '12px' : '0px'}; font-size: 9pt; vertical-align: top;">
                            ${detailsContent2}
                        </td>
                    </tr>
                    <!-- Fila de Espaciado -->
                    <tr style="height: 15px;">
                        <td colspan="3" style="font-size: 1pt; line-height: 1pt;">&nbsp;</td>
                    </tr>
                `;
            }

            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <title> </title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>100</w:Zoom>
                            <w:DoNotOptimizeForBrowser/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        @page Section1 {
                            size: 8.5in 11.0in;
                            margin: 1.0in 1.0in 1.0in 1.0in;
                            mso-header-margin: 0.5in;
                            mso-header: h1;
                            mso-paper-source: 0;
                        }
                        div.Section1 {
                            page: Section1;
                        }
                        body {
                            font-family: Calibri, Arial, sans-serif;
                            color: #1e293b;
                        }
                        p {
                            margin: 0;
                        }
                        p.MsoHeader, li.MsoHeader, div.MsoHeader {
                            margin: 0in;
                            margin-bottom: .0001pt;
                            mso-pagination: widow-orphan;
                            tab-stops: center 3.0in right 6.0in;
                        }
                    </style>
                </head>
                <body>
                    <!-- NATIVE HEADER CONTAINER OUTSIDE SECTION FLOW -->
                    <div style="mso-element: header;" id="h1">
                        <p class="MsoHeader">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #cafd00; padding-bottom: 8px; font-family: Calibri, Arial, sans-serif;">
                                <tr>
                                    <td style="vertical-align: middle; width: 120px;">
                                        ${logoHtml}
                                    </td>
                                    <td align="right" style="vertical-align: bottom; font-family: Arial, sans-serif;">
                                        <h1 style="font-size: 14pt; margin: 0; text-transform: uppercase; color: #0f172a; font-weight: bold; letter-spacing: 0.5px;">Reporte de Evidencias Fotogr&aacute;ficas - ${escapeHtml(proj.name.toUpperCase())}</h1>
                                        <p style="font-size: 8pt; color: #64748b; margin: 2px 0 0 0;">Generado autom&aacute;ticamente por LogiStudio</p>
                                    </td>
                                </tr>
                            </table>
                        </p>
                    </div>

                    <div class="Section1">
                        <!-- BODY CONTENT -->
                        <table align="center" border="0" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 8px; font-family: Calibri, Arial, sans-serif; font-size: 10pt; margin-bottom: 25px; table-layout: fixed;">
                            <colgroup>
                                <col style="width: 25%;" />
                                <col style="width: 25%;" />
                                <col style="width: 25%;" />
                                <col style="width: 25%;" />
                            </colgroup>
                            <tr>
                                <td style="vertical-align: top; padding: 10px;">
                                    <strong style="display: block; color: #64748b; font-size: 8pt; text-transform: uppercase; margin-bottom: 2px;">Proyecto</strong>
                                    <span style="font-weight: bold; color: #0f172a; text-transform: uppercase;">${escapeHtml(proj.name)}</span>
                                </td>
                                <td style="vertical-align: top; padding: 10px;">
                                    <strong style="display: block; color: #64748b; font-size: 8pt; text-transform: uppercase; margin-bottom: 2px;">Fecha de Reporte</strong>
                                    <span style="color: #0f172a;">${escapeHtml(reportDate)}</span>
                                </td>
                                <td style="vertical-align: top; padding: 10px;">
                                    <strong style="display: block; color: #64748b; font-size: 8pt; text-transform: uppercase; margin-bottom: 2px;">Filtro Aplicado</strong>
                                    <span style="color: #0f172a;">${escapeHtml(filterText)}</span>
                                </td>
                                <td style="vertical-align: top; padding: 10px;">
                                    <strong style="display: block; color: #64748b; font-size: 8pt; text-transform: uppercase; margin-bottom: 2px;">Total Evidencias</strong>
                                    <span style="font-weight: bold; color: #0f172a;">${this.reportPhotos.length}</span>
                                </td>
                            </tr>
                        </table>

                        <div style="margin-top: 20px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                                <colgroup>
                                    <col style="width: 48%;" />
                                    <col style="width: 4%;" />
                                    <col style="width: 48%;" />
                                </colgroup>
                                ${rowsHtml}
                            </table>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Construir el documento en formato MHTML
            let mhtmlParts = [];
            
            // Parte 1: Cabeceras MHTML
            mhtmlParts.push("MIME-Version: 1.0\r\n");
            mhtmlParts.push(`Content-Type: multipart/related; boundary="${boundary}"\r\n\r\n`);

            // Parte 2: Contenido HTML
            mhtmlParts.push(`--${boundary}\r\n`);
            mhtmlParts.push("Content-Type: text/html; charset=\"utf-8\"\r\n");
            mhtmlParts.push("Content-Transfer-Encoding: 8bit\r\n\r\n");
            mhtmlParts.push(htmlContent.trim() + "\r\n\r\n");

            // Parte 3: Incrustar Logo (si existe)
            if (hasLogo) {
                const logoRaw = logoB64.replace(/^data:image\/[a-z]+;base64,/, '');
                const logoMime = logoB64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
                mhtmlParts.push(`--${boundary}\r\n`);
                mhtmlParts.push(`Content-Type: ${logoMime}\r\n`);
                mhtmlParts.push("Content-Transfer-Encoding: base64\r\n");
                mhtmlParts.push("Content-ID: <logo>\r\n\r\n");
                mhtmlParts.push(logoRaw + "\r\n\r\n");
            }

            // Parte 4: Incrustar fotos
            for (const embed of photoEmbeds) {
                mhtmlParts.push(`--${boundary}\r\n`);
                mhtmlParts.push(`Content-Type: ${embed.mime}\r\n`);
                mhtmlParts.push("Content-Transfer-Encoding: base64\r\n");
                mhtmlParts.push(`Content-ID: <${embed.cid}>\r\n\r\n`);
                mhtmlParts.push(embed.data + "\r\n\r\n");
            }

            // Parte 5: Fin MHTML
            mhtmlParts.push(`--${boundary}--\r\n`);

            const mhtmlContent = mhtmlParts.join("");

            // Guardar como Blob usando la extensión .doc
            const blob = new Blob([mhtmlContent], {
                type: 'application/msword;charset=utf-8'
            });

            const cleanProjName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const filename = `reporte_${cleanProjName}_${new Date().toISOString().slice(0, 10)}.doc`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("[ExportScreen] Error al generar Word:", err);
            alert("Error al exportar Word: " + err.message);
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
