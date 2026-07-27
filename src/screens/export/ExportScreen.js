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
    selectedFormat: 'formato1',
    savedMode: 'todo',
    savedDay: new Date().toISOString().split('T')[0],
    savedMonth: new Date().toISOString().split('T')[0].substring(0, 7),
    savedStart: new Date().toISOString().split('T')[0],
    savedEnd: new Date().toISOString().split('T')[0],

    getCatalogUnit(activityCode) {
        if (!activityCode) return 'GL';
        const cleanCode = String(activityCode).trim().toUpperCase();
        const catItem = State.catalog?.find(c => String(c.item).toUpperCase() === cleanCode);
        if (catItem && catItem.unidad) return catItem.unidad;
        
        // Fallback: tratar de extraer de la descripción si contiene corchetes o paréntesis, ej: "(m3)" o "[m]"
        const desc = catItem?.descripcion || '';
        const match = desc.match(/[\[\((](m|m2|m3|gl|und|un|kg|t|global|ml|ha|km)[\]\)]/i);
        if (match) return match[1].toUpperCase();
        
        return 'GL'; // Default fallback
    },

    getLayout() {
        if (this.assistantMode) {
            return this.getAssistantLayout();
        }
        const proj = State.currentProject;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-5 space-y-5">
                <!-- Header Exportar -->
                <div class="flex justify-between items-center border-b border-white/10 pb-2.5 shrink-0">
                    <div>
                        <span class="text-[9px] font-bold font-headline uppercase tracking-widest text-primary">Estación de Generación de Informes</span>
                        <h1 class="text-xl font-bold font-headline text-white">Informes y Respaldos</h1>
                    </div>
                </div>

                <!-- Barra Superior de Control (Toolbar Unificado en una sola fila) -->
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0c] border border-white/10 p-4 rounded-2xl w-full shrink-0">
                    <!-- Filtros de Rango (Lado Izquierdo) -->
                    <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-white/40 font-headline">Rango:</span>
                            <select id="export-select-mode" class="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-primary outline-none font-body">
                                <option value="todo" ${this.savedMode === 'todo' ? 'selected' : ''}>Todo el Proyecto</option>
                                <option value="dia" ${this.savedMode === 'dia' ? 'selected' : ''}>Día Específico</option>
                                <option value="mes" ${this.savedMode === 'mes' ? 'selected' : ''}>Mes Específico</option>
                                <option value="rango" ${this.savedMode === 'rango' ? 'selected' : ''}>Rango de Fechas</option>
                            </select>
                        </div>
                        
                        <div id="export-date-day-box" class="hidden">
                            <input id="export-date-day" type="date" value="${this.savedDay}" class="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:border-primary outline-none font-body" />
                        </div>

                        <div id="export-date-month-box" class="hidden">
                            <input id="export-date-month" type="month" value="${this.savedMonth}" class="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:border-primary outline-none font-body" />
                        </div>

                        <div id="export-date-range-box" class="flex gap-2 hidden">
                            <input id="export-date-start" type="date" value="${this.savedStart}" class="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:border-primary outline-none font-body" />
                            <span class="text-white/40 text-xs self-center">a</span>
                            <input id="export-date-end" type="date" value="${this.savedEnd}" class="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:border-primary outline-none font-body" />
                        </div>
                    </div>

                    <!-- Acciones Principales (Lado Derecho) -->
                    <div class="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button id="btn-export-excel" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">table_chart</span>
                            <span>Excel (.xlsx)</span>
                        </button>
                        <button id="btn-export-zip" class="px-3.5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">folder_zip</span>
                            <span>Respaldo ZIP</span>
                        </button>
                        <button id="btn-start-assistant" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                            <span>Iniciar Asistente</span>
                        </button>
                    </div>
                </div>

                <!-- Sección Principal: Selector de Formato de Reporte -->
                <div class="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
                    <div class="shrink-0">
                        <h2 class="text-sm font-bold font-headline text-white uppercase tracking-wider">Formatos de Reporte Fotográfico</h2>
                        <p class="text-xs text-white/40 mt-0.5">Selecciona el diseño de página que se aplicará al generar el informe en PDF y Word.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-1 select-none">
                        
                        <!-- Tarjeta Formato 1 -->
                        <div class="format-card p-5 bg-[#0a0a0c] border rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer ${this.selectedFormat === 'formato1' ? 'border-primary bg-primary/[0.02] shadow-[0_0_15px_rgba(202,253,0,0.05)]' : 'border-white/10 hover:border-white/30'}" data-format="formato1">
                            <div class="space-y-4">
                                <!-- Previsualización CSS -->
                                <div class="flex justify-center p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div class="w-40 h-56 bg-[#0c0c0e] border border-white/10 rounded p-2 flex flex-col justify-between">
                                        <!-- Header ficticio -->
                                        <div class="flex justify-between items-center border-b border-white/5 pb-1">
                                            <div class="w-8 h-1 bg-white/20 rounded"></div>
                                            <div class="w-12 h-1 bg-primary/45 rounded"></div>
                                        </div>
                                        <!-- Grilla 2x4 -->
                                        <div class="grid grid-cols-2 gap-1 flex-1 py-1.5">
                                            ${Array(8).fill(0).map(() => `
                                                <div class="border border-white/5 bg-white/[0.02] rounded p-0.5 flex flex-col space-y-0.5">
                                                    <div class="w-full h-5 bg-white/10 rounded"></div>
                                                    <div class="w-full h-1 bg-white/5 rounded"></div>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <!-- Footer ficticio -->
                                        <div class="w-full h-1 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-white flex items-center justify-between">
                                        <span>Cuadrícula Clásica (2x4)</span>
                                        ${this.selectedFormat === 'formato1' ? '<span class="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">Activo</span>' : ''}
                                    </h3>
                                    <p class="text-xs text-white/40 mt-1.5 leading-relaxed">Presenta hasta 8 fotos por página dispuestas en 2 columnas y hasta 4 filas. Maximiza la densidad de información y reduce hojas.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Tarjeta Formato 2 -->
                        <div class="format-card p-5 bg-[#0a0a0c] border rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer ${this.selectedFormat === 'formato2' ? 'border-primary bg-primary/[0.02] shadow-[0_0_15px_rgba(202,253,0,0.05)]' : 'border-white/10 hover:border-white/30'}" data-format="formato2">
                            <div class="space-y-4">
                                <!-- Previsualización CSS -->
                                <div class="flex justify-center p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div class="w-40 h-56 bg-[#0c0c0e] border border-white/10 rounded p-2.5 flex flex-col justify-between">
                                        <!-- Header ficticio -->
                                        <div class="flex justify-between items-center border-b border-white/5 pb-1">
                                            <div class="w-8 h-1 bg-white/20 rounded"></div>
                                            <div class="w-12 h-1 bg-primary/45 rounded"></div>
                                        </div>
                                        <!-- Grid 2x1 -->
                                        <div class="flex-1 flex flex-col justify-center space-y-2 py-2">
                                            <div class="grid grid-cols-2 gap-2">
                                                <div class="border border-white/5 bg-white/[0.02] rounded p-1 flex flex-col space-y-1.5">
                                                    <div class="w-full h-16 bg-white/10 rounded"></div>
                                                    <div class="space-y-1">
                                                        <div class="w-full h-1 bg-white/5 rounded"></div>
                                                        <div class="w-2/3 h-1 bg-white/5 rounded"></div>
                                                    </div>
                                                </div>
                                                <div class="border border-white/5 bg-white/[0.02] rounded p-1 flex flex-col space-y-1.5">
                                                    <div class="w-full h-16 bg-white/10 rounded"></div>
                                                    <div class="space-y-1">
                                                        <div class="w-full h-1 bg-white/5 rounded"></div>
                                                        <div class="w-2/3 h-1 bg-white/5 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Footer ficticio -->
                                        <div class="w-full h-1 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-white flex items-center justify-between">
                                        <span>Duplo Clásico (2x1)</span>
                                        ${this.selectedFormat === 'formato2' ? '<span class="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">Activo</span>' : ''}
                                    </h3>
                                    <p class="text-xs text-white/40 mt-1.5 leading-relaxed">Presenta exactamente 2 fotos por página (2 columnas, 1 fila) a gran escala. Destaca detalles de obra con descripciones amplias y legibles.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Tarjeta Formato 3 -->
                        <div class="format-card p-5 bg-[#0a0a0c] border rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer ${this.selectedFormat === 'formato3' ? 'border-primary bg-primary/[0.02] shadow-[0_0_15px_rgba(202,253,0,0.05)]' : 'border-white/10 hover:border-white/30'}" data-format="formato3">
                            <div class="space-y-4">
                                <!-- Previsualización CSS -->
                                <div class="flex justify-center p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div class="w-40 h-56 bg-[#0c0c0e] border border-white/10 rounded p-2.5 flex flex-col justify-between">
                                        <!-- Header ficticio -->
                                        <div class="flex justify-between items-center border-b border-white/5 pb-1">
                                            <div class="w-8 h-1 bg-white/20 rounded"></div>
                                            <div class="w-12 h-1 bg-primary/45 rounded"></div>
                                        </div>
                                        <!-- Ficha Técnica -->
                                        <div class="flex-1 flex flex-col justify-center space-y-2 py-2">
                                            <div class="border border-white/10 bg-white/[0.01] rounded overflow-hidden flex flex-col">
                                                <div class="grid grid-cols-2 gap-1 p-1 bg-white/[0.02]">
                                                    <div class="w-full h-12 bg-white/10 rounded-sm"></div>
                                                    <div class="w-full h-12 bg-white/10 rounded-sm"></div>
                                                </div>
                                                <div class="p-1 border-t border-white/5 space-y-1 bg-black/20">
                                                    <div class="flex justify-between">
                                                        <div class="w-6 h-1 bg-primary/40 rounded"></div>
                                                        <div class="w-4 h-1 bg-white/20 rounded"></div>
                                                    </div>
                                                    <div class="w-full h-1 bg-white/5 rounded"></div>
                                                    <div class="w-4/5 h-1 bg-white/5 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Footer ficticio -->
                                        <div class="w-full h-1 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-white flex items-center justify-between">
                                        <span>Ficha Técnica Unificada</span>
                                        ${this.selectedFormat === 'formato3' ? '<span class="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">Activo</span>' : ''}
                                    </h3>
                                    <p class="text-xs text-white/40 mt-1.5 leading-relaxed">Agrupa fotos en parejas en una tabla técnica unificada, compartiendo código de actividad, unidad de medida y descripción unificada.</p>
                                </div>
                            </div>
                        </div>

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
            selectMode.onchange = () => {
                this.savedMode = selectMode.value;
                updateVisibility();
            };
            updateVisibility();
        }

        const dateDay = document.getElementById('export-date-day');
        if (dateDay) {
            dateDay.onchange = () => { this.savedDay = dateDay.value; };
        }
        const dateMonth = document.getElementById('export-date-month');
        if (dateMonth) {
            dateMonth.onchange = () => { this.savedMonth = dateMonth.value; };
        }
        const dateStart = document.getElementById('export-date-start');
        if (dateStart) {
            dateStart.onchange = () => { this.savedStart = dateStart.value; };
        }
        const dateEnd = document.getElementById('export-date-end');
        if (dateEnd) {
            dateEnd.onchange = () => { this.savedEnd = dateEnd.value; };
        }

        // Selección de formato de reporte
        document.querySelectorAll('.format-card').forEach(card => {
            card.onclick = () => {
                this.selectedFormat = card.dataset.format;
                Architect.render('export');
            };
        });

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

        if (this.reportPhotos.length > 300) {
            const proceed = confirm(`Advertencia: Vas a generar un PDF con ${this.reportPhotos.length} fotos. Esto consumirá una gran cantidad de memoria y podría congelar o cerrar la pestaña del navegador.\n\nTe recomendamos filtrar por rango de fechas en la pantalla anterior.\n\n¿Deseas continuar de todos modos?`);
            if (!proceed) return;
        }

        window.showLoader("Generando Reporte", "Cargando metadatos y fotos de IndexedDB...");

        try {
            const logoB64 = await LogiNative.getLogo();
            const logoHtml = logoB64 ? `<img class="header-logo" src="${logoB64}" alt="Logo" />` : `
                <div style="font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 22px; color: #000; letter-spacing: -0.5px;">
                    <span style="color: #cafd00;">L</span>OGI<span style="color: #cafd00; margin-left: 2px;">STUDIO</span>
                </div>
            `;

            let photoCardsHtml = '';

            if (this.selectedFormat === 'formato1') {
                for (let i = 0; i < this.reportPhotos.length; i++) {
                    const photo = this.reportPhotos[i];
                    const imgUrl = await LogiNative.getBlobUri(photo.filename);
                    const catItem = State.catalog?.find(c => String(c.item).toUpperCase() === (photo.actividad || '').toUpperCase());
                    const displayDesc = photo.descripcion || (catItem ? catItem.descripcion : '') || '';
                    const isGeneral = !photo.actividad || String(photo.actividad).trim().toUpperCase() === 'GENERAL';

                    let detailsHtml = '';
                    if (!isGeneral || displayDesc) {
                        detailsHtml = `
                            <div class="photo-details" style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; font-size: 11px;">
                                ${!isGeneral ? `
                                    <div class="photo-act-time" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 6px;">
                                        <span class="photo-act" style="font-weight: 700; color: #000; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${photo.actividad}</span>
                                    </div>
                                ` : ''}
                                ${displayDesc ? `
                                    <p class="photo-desc" style="color: #334155; line-height: 1.4; margin: 0; font-family: Arial, sans-serif;">${displayDesc}</p>
                                ` : ''}
                            </div>
                        `;
                    }

                    photoCardsHtml += `
                        <div class="photo-card" style="page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; height: auto;">
                            <div style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 6px 12px; font-size: 10px; font-weight: bold; color: #64748b; font-family: Arial, sans-serif;">
                                FOTO #${i + 1}
                            </div>
                            <div style="width: 100%; height: 210px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #cbd5e1;">
                                <img src="${imgUrl || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                            </div>
                            ${detailsHtml}
                        </div>
                    `;

                    // Salto de página cada 8 fotos (4 filas) en PDF
                    if ((i + 1) % 8 === 0 && (i + 1) < this.reportPhotos.length) {
                        photoCardsHtml += `<div style="page-break-after: always; grid-column: span 2; height: 0; margin: 0; padding: 0;"></div>`;
                    }
                }
            } else if (this.selectedFormat === 'formato2') {
                for (let i = 0; i < this.reportPhotos.length; i += 2) {
                    const photo1 = this.reportPhotos[i];
                    const photo2 = this.reportPhotos[i + 1];

                    const imgUrl1 = await LogiNative.getBlobUri(photo1.filename);
                    const catItem1 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo1.actividad || '').toUpperCase());
                    const displayDesc1 = photo1.descripcion || (catItem1 ? catItem1.descripcion : '') || '';

                    let photo2Html = '';
                    if (photo2) {
                        const imgUrl2 = await LogiNative.getBlobUri(photo2.filename);
                        const catItem2 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo2.actividad || '').toUpperCase());
                        const displayDesc2 = photo2.descripcion || (catItem2 ? catItem2.descripcion : '') || '';
                        photo2Html = `
                            <div class="photo-card" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; height: auto;">
                                <div style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 6px 12px; font-size: 10px; font-weight: bold; color: #64748b; font-family: Arial, sans-serif;">
                                    FOTO #${i + 2}
                                </div>
                                <div style="width: 100%; height: 210px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #cbd5e1;">
                                    <img src="${imgUrl2 || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                                </div>
                                <div style="padding: 12px; font-size: 11px; flex: 1;">
                                    <div style="margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                        <span style="font-weight: 700; color: #000; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${photo2.actividad || 'GENERAL'}</span>
                                    </div>
                                    <p style="color: #334155; line-height: 1.4; margin: 0; font-family: Arial, sans-serif;">${displayDesc2}</p>
                                </div>
                            </div>
                        `;
                    } else {
                        photo2Html = `<div style="border: 1px solid transparent; background: transparent;"></div>`;
                    }

                    photoCardsHtml += `
                        <div class="page-wrapper" style="page-break-after: always; display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 25px;">
                            <div class="grid-photos" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div class="photo-card" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; height: auto;">
                                    <div style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 6px 12px; font-size: 10px; font-weight: bold; color: #64748b; font-family: Arial, sans-serif;">
                                        FOTO #${i + 1}
                                    </div>
                                    <div style="width: 100%; height: 210px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #cbd5e1;">
                                        <img src="${imgUrl1 || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                                    </div>
                                    <div style="padding: 12px; font-size: 11px; flex: 1;">
                                        <div style="margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                            <span style="font-weight: 700; color: #000; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${photo1.actividad || 'GENERAL'}</span>
                                        </div>
                                        <p style="color: #334155; line-height: 1.4; margin: 0; font-family: Arial, sans-serif;">${displayDesc1}</p>
                                    </div>
                                </div>
                                ${photo2Html}
                            </div>
                        </div>
                    `;
                }
            } else if (this.selectedFormat === 'formato3') {
                for (let i = 0; i < this.reportPhotos.length; i += 2) {
                    const photo1 = this.reportPhotos[i];
                    const photo2 = this.reportPhotos[i + 1];

                    const imgUrl1 = await LogiNative.getBlobUri(photo1.filename);
                    const imgUrl2 = photo2 ? await LogiNative.getBlobUri(photo2.filename) : '';

                    const catItem1 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo1.actividad || '').toUpperCase());
                    const displayDesc1 = photo1.descripcion || (catItem1 ? catItem1.descripcion : '') || '';
                    const unit1 = this.getCatalogUnit(photo1.actividad);

                    let combinedDesc = displayDesc1;
                    let combinedItem = photo1.actividad || 'GENERAL';
                    let combinedUnit = unit1;

                    if (photo2) {
                        const catItem2 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo2.actividad || '').toUpperCase());
                        const displayDesc2 = photo2.descripcion || (catItem2 ? catItem2.descripcion : '') || '';
                        
                        if (displayDesc2 && displayDesc2 !== displayDesc1) {
                            combinedDesc = displayDesc1 ? `${displayDesc1} / ${displayDesc2}` : displayDesc2;
                        }
                        if (photo2.actividad && photo2.actividad !== photo1.actividad) {
                            combinedItem = `${photo1.actividad || 'GENERAL'} + ${photo2.actividad}`;
                        }
                    }

                    photoCardsHtml += `
                        <div class="technical-card" style="page-break-inside: avoid; page-break-after: always; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; margin-bottom: 25px; font-family: Arial, sans-serif;">
                            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 50%; padding: 8px; border-bottom: 1px solid #cbd5e1; background: #f8fafc; text-align: center; vertical-align: middle;">
                                        <div style="font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 4px; text-align: left;">FOTO #${i + 1}</div>
                                        <img src="${imgUrl1 || ''}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />
                                    </td>
                                    <td style="width: 50%; padding: 8px; border-bottom: 1px solid #cbd5e1; background: #f8fafc; border-left: 1px solid #cbd5e1; text-align: center; vertical-align: middle;">
                                        ${photo2 ? `
                                            <div style="font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 4px; text-align: left;">FOTO #${i + 2}</div>
                                            <img src="${imgUrl2 || ''}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />
                                        ` : `
                                            <div style="color: #94a3b8; font-size: 11px; font-style: italic;">Sin evidencia adicional</div>
                                        `}
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 10px; background: #fff;">
                                        <table border="0" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10px;">
                                            <tr>
                                                <td style="width: 25%; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold; color: #475569;">FOTOS REGISTRADAS</td>
                                                <td style="width: 25%; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold;">#${i + 1} ${photo2 ? `y #${i + 2}` : ''}</td>
                                                <td style="width: 25%; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold; color: #475569;">ACTIVIDAD / ÍTEM</td>
                                                <td style="width: 25%; border: 1px solid #cbd5e1; color: #0f172a; font-family: monospace; font-weight: bold; text-transform: uppercase;">${combinedItem}</td>
                                            </tr>
                                            <tr>
                                                <td style="border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold; color: #475569;">UNIDAD DE MEDIDA</td>
                                                <td colspan="3" style="border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; text-transform: uppercase;">${combinedUnit}</td>
                                            </tr>
                                            <tr>
                                                <td style="border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold; color: #475569; vertical-align: top;">DESCRIPCIÓN UNIFICADA</td>
                                                <td colspan="3" style="border: 1px solid #cbd5e1; color: #334155; line-height: 1.4; vertical-align: top;">${combinedDesc || 'Sin descripción técnica registrada.'}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    `;
                }
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
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                        body {
                            font-family: Arial, Helvetica, sans-serif;
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
                            font-family: Arial, Helvetica, sans-serif;
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
                        .report-content {
                            width: 100%;
                            display: block;
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
 
                    ${this.selectedFormat === 'formato1' ? `
                        <div class="grid-photos">
                            ${photoCardsHtml}
                        </div>
                    ` : `
                        <div class="report-content">
                            ${photoCardsHtml}
                        </div>
                    `}
 
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

        if (this.reportPhotos.length > 300) {
            const proceed = confirm(`Advertencia: Vas a generar un documento Word con ${this.reportPhotos.length} fotos. Esto consumirá una gran cantidad de memoria y podría fallar o congelar el navegador.\n\nTe recomendamos filtrar por rango de fechas en la pantalla anterior.\n\n¿Deseas continuar de todos modos?`);
            if (!proceed) return;
        }

        window.showLoader("Generando Word", "Construyendo documento editable...");

        try {
            const boundary = "----=_NextPart_LogiStudio_Workspace_Boundary";
            const logoB64 = await LogiNative.getLogo();
            
            const hasLogo = !!logoB64;
            let logoRaw = '';
            let logoMime = 'image/jpeg';
            if (hasLogo) {
                const logoParts = logoB64.split(';base64,');
                logoRaw = logoParts[1] || logoB64;
                logoMime = logoParts[0].replace(/^data:/, '') || 'image/jpeg';
            }

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

            // Agrupar fotos según formato
            let rowsHtml = '';
            const photoEmbeds = [];

            const chunkBase64 = (base64Str) => {
                if (!base64Str) return '';
                const clean = base64Str.replace(/[\r\n]/g, '');
                return clean.match(/.{1,76}/g).join("\r\n");
            };

            const registerPhoto = async (photo) => {
                if (!photo) return;
                const base64Data = await LogiNative.readBlobAsBase64(photo.filename);
                if (base64Data) {
                    const parts = base64Data.split(';base64,');
                    const rawBase64 = parts[1] || base64Data;
                    const mimeType = parts[0].replace(/^data:/, '') || 'image/jpeg';
                    photoEmbeds.push({
                        cid: `photo_${photo.id}`,
                        mime: mimeType,
                        data: rawBase64
                    });
                }
            };

            const generateWordTwoColumnRow = (photo1, photo2, card1Num, card2Num, isLastRow = false) => {
                const catalogItem1 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo1.actividad || '').toUpperCase());
                const catalogDesc1 = catalogItem1 ? catalogItem1.descripcion : '';
                const displayDesc1 = photo1.descripcion || catalogDesc1 || '';
                
                const isGeneral1 = !photo1.actividad || String(photo1.actividad).trim().toUpperCase() === 'GENERAL';
                const hasAct1 = !isGeneral1;
                const hasDesc1 = !!displayDesc1;

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

                let html = `
                    <tr>
                        <td style="width: 48%; background-color: #f8fafc; border-top: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 6px 12px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; font-weight: bold; color: #64748b;">
                            FOTO #${card1Num}
                        </td>
                        <td style="width: 4%;"></td>
                        <td style="width: 48%; background-color: ${photo2 ? '#f8fafc' : 'transparent'}; border-top: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: 6px 12px; font-family: Calibri, Arial, sans-serif; font-size: 9pt; font-weight: bold; color: #64748b;">
                            ${photo2 ? `FOTO #${card2Num}` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="width: 48%; background-color: #ffffff; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 10px; vertical-align: middle;">
                            <img src="cid:photo_${photo1.id}" width="280" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />
                        </td>
                        <td style="width: 4%;"></td>
                        <td align="center" style="width: 48%; background-color: ${photo2 ? '#ffffff' : 'transparent'}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: 10px; vertical-align: middle;">
                            ${photo2 ? `<img src="cid:photo_${photo2.id}" width="280" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 48%; background-color: #ffffff; border-bottom: ${borderBottom1}; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 12px; font-size: 9pt; vertical-align: top;">
                            ${detailsContent1}
                        </td>
                        <td style="width: 4%;"></td>
                        <td style="width: 48%; background-color: ${photo2 ? '#ffffff' : 'transparent'}; border-bottom: ${borderBottom2}; border-left: ${photo2 ? '1px solid #cbd5e1' : '0'}; border-right: ${photo2 ? '1px solid #cbd5e1' : '0'}; padding: ${photo2 ? '12px' : '0px'}; font-size: 9pt; vertical-align: top;">
                            ${detailsContent2}
                        </td>
                    </tr>
                `;

                if (!isLastRow) {
                    html += `
                        <!-- Fila de Espaciado -->
                        <tr style="height: 15px;">
                            <td colspan="3" style="font-size: 1pt; line-height: 1pt;">&nbsp;</td>
                        </tr>
                    `;
                }
                return html;
            };

            if (this.selectedFormat === 'formato1') {
                for (let i = 0; i < this.reportPhotos.length; i += 2) {
                    const photo1 = this.reportPhotos[i];
                    const photo2 = this.reportPhotos[i + 1];

                    await registerPhoto(photo1);
                    if (photo2) {
                        await registerPhoto(photo2);
                    }

                    const isLast = (i + 2) >= this.reportPhotos.length;
                    rowsHtml += generateWordTwoColumnRow(photo1, photo2, i + 1, i + 2, isLast);

                    // Salto de página cada 8 fotos (4 filas) en Word
                    if ((i + 2) % 8 === 0 && (i + 2) < this.reportPhotos.length) {
                        rowsHtml += `
                            </table>
                            <br clear="all" style="page-break-before: always; mso-special-character:line-break;" />
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 15px;">
                                <colgroup>
                                    <col style="width: 48%;" />
                                    <col style="width: 4%;" />
                                    <col style="width: 48%;" />
                                </colgroup>
                        `;
                    }
                }
            } else if (this.selectedFormat === 'formato2') {
                for (let i = 0; i < this.reportPhotos.length; i += 2) {
                    const photo1 = this.reportPhotos[i];
                    const photo2 = this.reportPhotos[i + 1];

                    await registerPhoto(photo1);
                    if (photo2) {
                        await registerPhoto(photo2);
                    }

                    const isLast = (i + 2) >= this.reportPhotos.length;
                    rowsHtml += generateWordTwoColumnRow(photo1, photo2, i + 1, i + 2, isLast);

                    // Salto de página después de cada fila (cada 2 fotos) en Word
                    if ((i + 2) < this.reportPhotos.length) {
                        rowsHtml += `
                            </table>
                            <br clear="all" style="page-break-before: always; mso-special-character:line-break;" />
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 15px;">
                                <colgroup>
                                    <col style="width: 48%;" />
                                    <col style="width: 4%;" />
                                    <col style="width: 48%;" />
                                </colgroup>
                        `;
                    }
                }
            } else if (this.selectedFormat === 'formato3') {
                for (let i = 0; i < this.reportPhotos.length; i += 2) {
                    const photo1 = this.reportPhotos[i];
                    const photo2 = this.reportPhotos[i + 1];

                    await registerPhoto(photo1);
                    if (photo2) {
                        await registerPhoto(photo2);
                    }

                    const catItem1 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo1.actividad || '').toUpperCase());
                    const displayDesc1 = photo1.descripcion || (catItem1 ? catItem1.descripcion : '') || '';
                    const unit1 = this.getCatalogUnit(photo1.actividad);

                    let combinedDesc = displayDesc1;
                    let combinedItem = photo1.actividad || 'GENERAL';
                    let combinedUnit = unit1;

                    if (photo2) {
                        const catItem2 = State.catalog?.find(c => String(c.item).toUpperCase() === (photo2.actividad || '').toUpperCase());
                        const displayDesc2 = photo2.descripcion || (catItem2 ? catItem2.descripcion : '') || '';
                        
                        if (displayDesc2 && displayDesc2 !== displayDesc1) {
                            combinedDesc = displayDesc1 ? `${displayDesc1} / ${displayDesc2}` : displayDesc2;
                        }
                        if (photo2.actividad && photo2.actividad !== photo1.actividad) {
                            combinedItem = `${photo1.actividad || 'GENERAL'} + ${photo2.actividad}`;
                        }
                    }

                    rowsHtml += `
                        <tr>
                            <td colspan="3" style="width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 20px; font-family: Calibri, Arial, sans-serif;">
                                    <!-- Images Row -->
                                    <tr>
                                        <td align="center" style="width: 48%; padding: 8px; background-color: #f8fafc; border-bottom: 1px solid #cbd5e1; vertical-align: middle;">
                                            <div style="font-size: 8pt; font-weight: bold; color: #64748b; margin-bottom: 4px; text-align: left;">FOTO #${i + 1}</div>
                                            <img src="cid:photo_${photo1.id}" width="270" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />
                                        </td>
                                        <td style="width: 4%; background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;"></td>
                                        <td align="center" style="width: 48%; padding: 8px; background-color: #f8fafc; border-bottom: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; vertical-align: middle;">
                                            ${photo2 ? `
                                                <div style="font-size: 8pt; font-weight: bold; color: #64748b; margin-bottom: 4px; text-align: left;">FOTO #${i + 2}</div>
                                                <img src="cid:photo_${photo2.id}" width="270" height="190" style="display: block; margin: 0 auto; object-fit: cover;" />
                                            ` : `
                                                <div style="color: #cbd5e1; font-size: 9pt; font-style: italic; text-align: center;">Sin evidencia adicional</div>
                                            `}
                                        </td>
                                    </tr>
                                    <!-- Technical Data -->
                                    <tr>
                                        <td colspan="3" style="padding: 10px; background-color: #ffffff;">
                                            <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 8.5pt;">
                                                <tr>
                                                    <td style="width: 25%; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #cbd5e1;">FOTOS REGISTRADAS</td>
                                                    <td style="width: 25%; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1;">#${i + 1} ${photo2 ? `y #${i + 2}` : ''}</td>
                                                    <td style="width: 25%; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #cbd5e1;">ACTIVIDAD / ÍTEM</td>
                                                    <td style="width: 25%; color: #0f172a; font-family: monospace; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1;">${escapeHtml(combinedItem)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #cbd5e1;">UNIDAD DE MEDIDA</td>
                                                    <td colspan="3" style="color: #0f172a; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1;">${escapeHtml(combinedUnit)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="background-color: #f8fafc; font-weight: bold; color: #475569; vertical-align: top; border: 1px solid #cbd5e1;">DESCRIPCIÓN UNIFICADA</td>
                                                    <td colspan="3" style="color: #334155; line-height: 1.4; vertical-align: top; border: 1px solid #cbd5e1;">${escapeHtml(combinedDesc) || 'Sin descripci&oacute;n t&eacute;cnica registrada.'}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Fila de Espaciado -->
                        <tr style="height: 15px;">
                            <td colspan="3" style="font-size: 1pt; line-height: 1pt;">&nbsp;</td>
                        </tr>
                    `;

                    // Salto de página después de cada ficha técnica en Word
                    if ((i + 2) < this.reportPhotos.length) {
                        rowsHtml += `
                            </table>
                            <br clear="all" style="page-break-before: always; mso-special-character:line-break;" />
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 15px;">
                                <colgroup>
                                    <col style="width: 48%;" />
                                    <col style="width: 4%;" />
                                    <col style="width: 48%;" />
                                </colgroup>
                        `;
                    }
                }
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
                mhtmlParts.push(`--${boundary}\r\n`);
                mhtmlParts.push(`Content-Type: ${logoMime}\r\n`);
                mhtmlParts.push("Content-Transfer-Encoding: base64\r\n");
                mhtmlParts.push("Content-ID: <logo>\r\n\r\n");
                mhtmlParts.push(chunkBase64(logoRaw) + "\r\n\r\n");
            }

            // Parte 4: Incrustar fotos
            for (const embed of photoEmbeds) {
                mhtmlParts.push(`--${boundary}\r\n`);
                mhtmlParts.push(`Content-Type: ${embed.mime}\r\n`);
                mhtmlParts.push("Content-Transfer-Encoding: base64\r\n");
                mhtmlParts.push(`Content-ID: <${embed.cid}>\r\n\r\n`);
                mhtmlParts.push(chunkBase64(embed.data) + "\r\n\r\n");
            }

            // Parte 5: Fin MHTML
            mhtmlParts.push(`--${boundary}--\r\n`);

            // Guardar como Blob usando la extensión .doc (pasando las partes directamente para evitar límites de string en JS)
            const blob = new Blob(mhtmlParts, {
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
