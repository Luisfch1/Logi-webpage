/**
 * CaptureScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Photo Capture Studio with Batch Selection, Compact Grid & Direct Action Overlays
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';
import { ImageCompressor } from '../../utils/ImageCompressor.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const CaptureScreen = {
    selectedIds: [],
    searchTerm: '',
    renderedIds: [],
    lastClickedId: null,

    getLayout() {
        const projName = State.currentProject?.name || 'SELECCIONAR PROYECTO';
        const catalog = State.catalog || [];

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header del Workspace -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <h1 class="text-2xl font-bold font-headline text-white" id="capture-project-title">${projName}</h1>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <!-- Buscador Compacto de Evidencias -->
                        <div class="relative w-64">
                            <span class="material-symbols-outlined absolute left-3 top-2.5 text-white/30 text-base">search</span>
                            <input id="capture-search-input" type="text" placeholder="Buscar por ítem o descripción..." class="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:border-primary/50 outline-none" />
                            <button id="btn-clear-search" class="absolute right-3 top-2 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer p-0.5 rounded-full hover:bg-white/5 hidden" title="Limpiar búsqueda">
                                <span class="material-symbols-outlined text-[15px]">close</span>
                            </button>
                        </div>

                        <button id="btn-desktop-upload" class="px-3.5 py-2.5 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-base">upload_file</span>
                            <span>Cargar Fotos de Galería</span>
                        </button>
                    </div>
                </div>

                <!-- Panel de Control y Edición en Lote -->
                <div class="flex flex-col md:flex-row gap-4 bg-[#0a0a0c] p-4 rounded-xl border border-white/10 items-end">
                    <div class="w-full md:w-56 shrink-0">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">Ítem / Actividad</label>
                        <select id="desktop-select-item" class="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none">
                            <option value="GENERAL">GENERAL (Sin ítem específico)</option>
                            ${catalog.map(c => `<option value="${c.item}">${c.item} - ${c.descripcion}</option>`).join('')}
                        </select>
                    </div>

                    <div class="flex-1 min-w-[200px] w-full font-body">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">Descripción Técnica</label>
                        <input id="desktop-input-desc" type="text" placeholder="Escribe un comentario o descripción técnica..." class="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none" />
                    </div>

                    <div class="w-full md:w-44 shrink-0 font-body">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">Fecha Evidencia</label>
                        <input id="desktop-input-date" type="date" class="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none" />
                    </div>

                    <div class="flex gap-2 shrink-0 w-full md:w-auto">
                        <button id="btn-apply-batch" class="flex-1 md:flex-initial px-4 py-2 rounded-lg text-white/40 bg-white/5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-not-allowed opacity-50 h-[34px]" disabled>
                            <span class="material-symbols-outlined text-sm font-bold">check_circle</span>
                            <span id="txt-apply-batch">Aplicar (0)</span>
                        </button>
                        <button id="btn-delete-batch" class="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all cursor-not-allowed opacity-0 h-[34px]" disabled>
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Contenedor de Capturas Agrupadas por Fecha -->
                <div class="flex-1 overflow-y-auto space-y-6 pr-1">
                    <div id="desktop-capture-groups" class="space-y-6">
                        <!-- Inyectado por renderGrid() -->
                    </div>
                </div>
            </div>

            <!-- MODAL DE ZOOM DE FOTO -->
            <div id="photo-zoom-modal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                <div class="max-w-5xl max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-3xl p-4 flex flex-col items-center space-y-3 relative shadow-2xl">
                    <button id="btn-close-zoom-modal" class="absolute top-4 right-4 text-white/60 hover:text-white bg-black/60 p-2 rounded-full border border-white/10 cursor-pointer">
                        <span class="material-symbols-outlined text-xl">close</span>
                    </button>
                    <img id="zoom-modal-img" class="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/10" src="" alt="Vista Previa" />
                    <div id="zoom-modal-caption-box" class="w-full max-w-2xl text-center space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs select-text">
                        <div id="zoom-modal-item" class="font-bold text-primary truncate max-w-full"></div>
                        <div id="zoom-modal-desc" class="text-white/80 font-body leading-relaxed break-words whitespace-pre-wrap text-center max-h-24 overflow-y-auto pr-1"></div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.selectedIds = [];
        this.searchTerm = '';
        this.bindEvents();
        this.renderGrid();

        State.subscribe((state, changeType) => {
            if (changeType === 'items' || changeType === 'project') {
                this.selectedIds = [];
                this.renderGrid();
            }
        });
    },

    bindEvents() {
        const searchInput = document.getElementById('capture-search-input');
        const btnClearSearch = document.getElementById('btn-clear-search');
        if (searchInput) {
            searchInput.value = this.searchTerm || '';
            if (btnClearSearch) {
                if (this.searchTerm) btnClearSearch.classList.remove('hidden');
                else btnClearSearch.classList.add('hidden');
            }

            searchInput.oninput = (e) => {
                this.searchTerm = e.target.value;
                if (btnClearSearch) {
                    if (this.searchTerm) btnClearSearch.classList.remove('hidden');
                    else btnClearSearch.classList.add('hidden');
                }
                this.renderGrid();
            };
        }

        if (btnClearSearch) {
            btnClearSearch.onclick = () => {
                this.searchTerm = '';
                if (searchInput) searchInput.value = '';
                btnClearSearch.classList.add('hidden');
                this.renderGrid();
            };
        }

        const btnUpload = document.getElementById('btn-desktop-upload');
        if (btnUpload) {
            btnUpload.onclick = () => this.pickFilesFromPC();
        }

        const btnCloseZoom = document.getElementById('btn-close-zoom-modal');
        const zoomModal = document.getElementById('photo-zoom-modal');
        if (btnCloseZoom && zoomModal) {
            btnCloseZoom.onclick = () => zoomModal.classList.add('hidden');
        }

        const btnApplyBatch = document.getElementById('btn-apply-batch');
        if (btnApplyBatch) {
            btnApplyBatch.onclick = async () => {
                const itemSelect = document.getElementById('desktop-select-item');
                const descInput = document.getElementById('desktop-input-desc');
                const dateInput = document.getElementById('desktop-input-date');

                const activity = itemSelect ? itemSelect.value : 'GENERAL';
                const description = descInput ? descInput.value.trim() : '';
                const customDateStr = dateInput ? dateInput.value : '';

                if (this.selectedIds.length === 0) return;

                // Actualizar elementos en el Estado
                for (const id of this.selectedIds) {
                    const updates = { actividad: activity, descripcion: description };
                    if (customDateStr) {
                        updates.createdAt = new Date(customDateStr + 'T12:00:00').getTime();
                    }
                    await State.updateItem(id, updates);
                }

                // Limpiar selección y campos
                this.selectedIds = [];
                if (descInput) descInput.value = '';
                if (dateInput) dateInput.value = '';
                this.renderGrid();
            };
        }

        const btnDeleteBatch = document.getElementById('btn-delete-batch');
        if (btnDeleteBatch) {
            btnDeleteBatch.onclick = async () => {
                const count = this.selectedIds.length;
                if (count === 0) return;

                if (confirm(`¿Estás seguro de eliminar las ${count} evidencias seleccionadas del disco?`)) {
                    const idsToDelete = [...this.selectedIds];
                    this.selectedIds = [];

                    for (const id of idsToDelete) {
                        const item = State.items.find(i => i.id === id);
                        if (item) {
                            await State.deleteItem(id, item.filename);
                        }
                    }
                }
            };
        }

        // Clic fuera de las fotos deselecciona todo
        document.addEventListener('click', (e) => {
            // Solo actuar si estamos en la vista de captura
            const captureView = document.getElementById('desktop-capture-groups');
            if (!captureView) return;

            // Verificar si hay elementos seleccionados
            if (this.selectedIds.length === 0) return;

            // Verificar si el clic fue en un elemento interactivo que debe mantener la selección
            const isInsideCard = e.target.closest('.btn-select-card');
            const isInsideBatchControls = e.target.closest('#btn-apply-batch') || 
                                          e.target.closest('#btn-delete-batch') || 
                                          e.target.closest('#desktop-select-item') || 
                                          e.target.closest('#desktop-input-desc') || 
                                          e.target.closest('#desktop-input-date');
            const isInsideHeaderControls = e.target.closest('.btn-select-group-all') || 
                                           e.target.closest('.btn-deselect-group-all') || 
                                           e.target.closest('#btn-desktop-upload') ||
                                           e.target.closest('#capture-search-input') ||
                                           e.target.closest('#btn-clear-search');
            const isInsideModal = e.target.closest('#photo-zoom-modal');

            if (!isInsideCard && !isInsideBatchControls && !isInsideHeaderControls && !isInsideModal) {
                // Deseleccionar todas
                this.selectedIds = [];
                this.renderGrid();
            }
        });
    },

    pickFilesFromPC() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            const itemSelect = document.getElementById('desktop-select-item');
            const descInput = document.getElementById('desktop-input-desc');
            const dateInput = document.getElementById('desktop-input-date');

            const activity = itemSelect ? itemSelect.value : 'GENERAL';
            const defaultDescription = descInput ? descInput.value : '';
            const customDateStr = dateInput ? dateInput.value : '';

            const metadataList = [];
            const concurrency = 5;
            const fileChunks = [];
            for (let i = 0; i < files.length; i += concurrency) {
                fileChunks.push(files.slice(i, i + concurrency));
            }

            // Mostrar un indicador visual de carga
            const uploadBtn = document.getElementById('btn-desktop-upload');
            const originalHtml = uploadBtn ? uploadBtn.innerHTML : '';
            if (uploadBtn) {
                uploadBtn.disabled = true;
                uploadBtn.innerHTML = `<span class="material-symbols-outlined text-xs animate-spin">sync</span> Procesando ${files.length} fotos...`;
            }

            for (const chunk of fileChunks) {
                await Promise.all(chunk.map(async (file) => {
                    try {
                        let photoTimestamp = file.lastModified || Date.now();
                        if (customDateStr) {
                            const targetDate = new Date(customDateStr + 'T12:00:00');
                            const fileTime = new Date(file.lastModified || Date.now());
                            targetDate.setHours(fileTime.getHours(), fileTime.getMinutes(), fileTime.getSeconds(), fileTime.getMilliseconds());
                            photoTimestamp = targetDate.getTime();
                        }

                        const compressed = await ImageCompressor.compress(file, 1400, 0.75);
                        if (compressed.base64) {
                            const id = 'cap_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
                            const filename = id + '.jpg';

                            const data = {
                                id,
                                descripcion: defaultDescription,
                                actividad: activity,
                                createdAt: photoTimestamp,
                                projectId: State.currentProject?.id || 'p_default',
                                filename
                            };

                            await LogiNative.storeBlob(filename, compressed.base64);
                            data._tempImageSrc = "data:image/jpeg;base64," + compressed.base64;
                            metadataList.push(data);
                        }
                    } catch (err) {
                        console.error("Error procesando imagen:", err);
                    }
                }));
            }

            if (metadataList.length > 0) {
                await State.addItemsBatch(metadataList);
            }

            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = originalHtml;
            }

            if (descInput) descInput.value = '';
            if (dateInput) dateInput.value = '';
            this.selectedIds = [];
            this.renderGrid();
        };

        input.click();
    },

    updateBatchPanel() {
        const btnApply = document.getElementById('btn-apply-batch');
        const txtApply = document.getElementById('txt-apply-batch');
        const btnDelete = document.getElementById('btn-delete-batch');

        if (!btnApply) return;

        const count = this.selectedIds.length;
        if (count > 0) {
            btnApply.disabled = false;
            btnApply.className = "flex-1 md:flex-initial px-4 py-2 rounded-lg text-black bg-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all glow-border cursor-pointer h-[34px]";
            if (txtApply) txtApply.textContent = `Aplicar (${count})`;

            if (btnDelete) {
                btnDelete.disabled = false;
                btnDelete.className = "px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer opacity-100 h-[34px]";
            }
        } else {
            btnApply.disabled = true;
            btnApply.className = "flex-1 md:flex-initial px-4 py-2 rounded-lg text-white/40 bg-white/5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-not-allowed opacity-50 h-[34px]";
            if (txtApply) txtApply.textContent = "Aplicar (0)";

            if (btnDelete) {
                btnDelete.disabled = true;
                btnDelete.className = "px-3.5 py-2 rounded-lg bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all cursor-not-allowed opacity-0 h-[34px]";
            }
        }
    },

    async renderGrid() {
        const container = document.getElementById('desktop-capture-groups');
        if (!container) return;

        let items = State.items;
        const catalog = State.catalog || [];
        const query = (this.searchTerm || '').trim().toLowerCase();
        if (query) {
            items = items.filter(it => {
                const activityCode = (it.actividad || '').toLowerCase();
                const desc = (it.descripcion || '').toLowerCase();
                const date = (it.fechaStr || '').toLowerCase();
                
                // Buscar la descripción correspondiente en el catálogo de ítems
                const catalogItem = catalog.find(c => String(c.item).toLowerCase() === activityCode);
                const catalogDesc = catalogItem ? (catalogItem.descripcion || '').toLowerCase() : '';
                
                return activityCode.includes(query) || 
                       desc.includes(query) || 
                       date.includes(query) || 
                       catalogDesc.includes(query);
            });
        }

        if (State.items.length === 0) {
            container.innerHTML = `
                <div class="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-3">
                    <span class="material-symbols-outlined text-4xl text-white/20">photo_library</span>
                    <p class="text-sm font-bold text-white/60">No hay fotos registradas en este proyecto</p>
                    <p class="text-xs text-white/40 max-w-md mx-auto">Usa el botón "Cargar Fotos de Galería" para agregar fotos. Se organizarán automáticamente por la fecha en que fueron tomadas.</p>
                </div>
            `;
            this.updateBatchPanel();
            return;
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-3 bg-black/20">
                    <span class="material-symbols-outlined text-4xl text-white/20">search_off</span>
                    <p class="text-sm font-bold text-white/60">Sin coincidencias para "${this.searchTerm}"</p>
                    <p class="text-xs text-white/40 max-w-md mx-auto">Prueba buscando otro código de actividad, descripción o fecha.</p>
                </div>
            `;
            this.updateBatchPanel();
            return;
        }

        // Agrupar por Fecha (Día)
        const groups = {};
        items.forEach(it => {
            const groupKey = it.fechaStr || 'FECHA DESCONOCIDA';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(it);
        });

        const sortedGroupKeys = Object.keys(groups);

        // Conservar la lista ordenada de IDs renderizados para selección con Shift
        this.renderedIds = [];
        sortedGroupKeys.forEach(dateKey => {
            groups[dateKey].forEach(it => {
                this.renderedIds.push(it.id);
            });
        });

        container.innerHTML = sortedGroupKeys.map(dateKey => {
            const groupItems = groups[dateKey];
            return `
                <div class="space-y-4">
                    <!-- Encabezado de Fecha con Selección Grupal -->
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-lg">calendar_today</span>
                            <h3 class="font-headline font-bold text-sm text-white tracking-wide">${dateKey}</h3>
                            <span class="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">${groupItems.length} Evidencias</span>
                        </div>
                        <div class="flex items-center gap-3 text-[10px] font-mono">
                            <button class="btn-select-group-all text-primary hover:underline cursor-pointer" data-date="${dateKey}">Seleccionar Todas</button>
                            <span class="text-white/20">|</span>
                            <button class="btn-deselect-group-all text-white/40 hover:text-white hover:underline cursor-pointer" data-date="${dateKey}">Deseleccionar</button>
                        </div>
                    </div>

                    <!-- Cuadrícula Compacta Horizontal (Relación de Aspecto 16:9) -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        ${groupItems.map(it => {
                            const isSelected = this.selectedIds.includes(it.id);
                            const catalogItem = catalog.find(c => String(c.item).toLowerCase() === (it.actividad || '').toLowerCase());
                            const catalogDesc = catalogItem ? catalogItem.descripcion : '';
                            const displayDesc = it.descripcion || catalogDesc || 'Sin descripción';
                            return `
                                <div class="relative aspect-video bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden group cursor-pointer transition-all hover:border-primary/50 btn-select-card ${isSelected ? 'ring-2 ring-primary border-primary' : ''}" data-id="${it.id}">
                                    <!-- Imagen -->
                                    <img id="img-${it.id}" class="w-full h-full object-cover select-none pointer-events-none" src="${it._tempImageSrc || ''}" alt="Evidencia" />

                                    <!-- Degradado Base y Detalles -->
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-between p-3 select-none pointer-events-none z-10">
                                        <!-- Barra Superior: Check y Acciones Hover -->
                                        <div class="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all pointer-events-auto">
                                            <span class="check-icon material-symbols-outlined text-sm bg-black/60 p-1 rounded-full border border-white/10 ${isSelected ? 'text-primary font-bold' : 'text-white/60'}">
                                                ${isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                            
                                            <button class="btn-delete-single-photo bg-black/75 p-1.5 text-white/70 hover:text-rose-400 rounded-lg border border-white/10 hover:bg-black/90 transition-all cursor-pointer" data-id="${it.id}" data-file="${it.filename}" title="Eliminar Foto">
                                                <span class="material-symbols-outlined text-[15px]">delete</span>
                                            </button>
                                        </div>

                                        <!-- Detalles Inferiores -->
                                        <div class="space-y-1">
                                            <div class="flex justify-between items-end gap-2">
                                                <span class="text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.5 rounded truncate max-w-[80px]">${it.actividad || 'GENERAL'}</span>
                                                <span class="text-[8px] font-mono text-white/50">${it.timeStr || ''}</span>
                                            </div>
                                            ${displayDesc === 'Sin descripción' ? `
                                                <p class="text-[10px] text-white/30 italic truncate leading-tight font-body">Sin descripción</p>
                                            ` : `
                                                <p class="text-[10px] text-white/90 truncate leading-tight font-body" title="${displayDesc}">${displayDesc}</p>
                                            `}
                                        </div>
                                    </div>

                                    <!-- Indicador Visual Checkmark Flotante -->
                                    <div class="selected-badge absolute top-2 left-2 bg-primary text-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-black/40 z-20 ${isSelected ? '' : 'hidden'}">
                                        <span class="material-symbols-outlined text-[13px] font-bold">check</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // 1. Vincular Clic en Tarjeta para Selección
        container.querySelectorAll('.btn-select-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.btn-delete-single-photo')) {
                    return;
                }

                const id = card.dataset.id;

                if (e.shiftKey && this.lastClickedId && this.renderedIds.includes(this.lastClickedId)) {
                    // Seleccionar rango entre el último clic y el clic actual
                    const startIdx = this.renderedIds.indexOf(this.lastClickedId);
                    const endIdx = this.renderedIds.indexOf(id);
                    
                    const minIdx = Math.min(startIdx, endIdx);
                    const maxIdx = Math.max(startIdx, endIdx);
                    
                    // Añadir todos los elementos del rango a la selección
                    for (let i = minIdx; i <= maxIdx; i++) {
                        const targetId = this.renderedIds[i];
                        if (!this.selectedIds.includes(targetId)) {
                            this.selectedIds.push(targetId);
                        }
                    }
                    
                    // Renderizar la grilla de nuevo para actualizar badges e iconos
                    this.renderGrid();
                } else {
                    // Clic normal
                    const idx = this.selectedIds.indexOf(id);
                    if (idx === -1) {
                        this.selectedIds.push(id);
                        card.classList.add('ring-2', 'ring-primary', 'border-primary');
                        const badge = card.querySelector('.selected-badge');
                        if (badge) badge.classList.remove('hidden');
                        const icon = card.querySelector('.check-icon');
                        if (icon) {
                            icon.textContent = 'check_circle';
                            icon.classList.remove('text-white/60');
                            icon.classList.add('text-primary', 'font-bold');
                        }
                    } else {
                        this.selectedIds.splice(idx, 1);
                        card.classList.remove('ring-2', 'ring-primary', 'border-primary');
                        const badge = card.querySelector('.selected-badge');
                        if (badge) badge.classList.add('hidden');
                        const icon = card.querySelector('.check-icon');
                        if (icon) {
                            icon.textContent = 'radio_button_unchecked';
                            icon.classList.remove('text-primary', 'font-bold');
                            icon.classList.add('text-white/60');
                        }
                    }
                }
                
                // Guardar último ID cliqueado como ancla para Shift
                this.lastClickedId = id;
                this.updateBatchPanel();
            };
        });

        // 2. Vincular Ampliación de Foto con Doble Clic en la Tarjeta
        container.querySelectorAll('.btn-select-card').forEach(card => {
            card.ondblclick = async (e) => {
                if (e.target.closest('.btn-delete-single-photo')) return;

                const id = card.dataset.id;
                const item = State.items.find(i => i.id === id);
                const zoomModal = document.getElementById('photo-zoom-modal');
                const zoomImg = document.getElementById('zoom-modal-img');

                if (item && zoomModal && zoomImg) {
                    const src = item._tempImageSrc || await LogiNative.getBlobUri(item.filename);
                    zoomImg.src = src;
                    
                    const itemEl = document.getElementById('zoom-modal-item');
                    const descEl = document.getElementById('zoom-modal-desc');
                    
                    const catalogItem = catalog.find(c => String(c.item).toLowerCase() === (item.actividad || '').toLowerCase());
                    const catalogDesc = catalogItem ? catalogItem.descripcion : '';
                    
                    if (itemEl) {
                        itemEl.textContent = `ÍTEM: ${item.actividad || 'GENERAL'}${catalogDesc ? ` - ${catalogDesc}` : ''}`;
                    }
                    if (descEl) {
                        descEl.textContent = item.descripcion || 'Sin descripción personalizada';
                    }
                    
                    zoomModal.classList.remove('hidden');
                }
            };
        });

        // 3. Vincular Eliminación de Foto Individual
        container.querySelectorAll('.btn-delete-single-photo').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const filename = btn.dataset.file;
                if (confirm("¿Estás seguro de eliminar esta evidencia del disco?")) {
                    // Remover de la selección si estaba marcado
                    this.selectedIds = this.selectedIds.filter(i => i !== id);
                    await State.deleteItem(id, filename);
                }
            };
        });

        // 4. Vincular Botones de Selección Colectiva por Día
        container.querySelectorAll('.btn-select-group-all').forEach(btn => {
            btn.onclick = () => {
                const dateKey = btn.dataset.date;
                const groupItems = groups[dateKey] || [];
                groupItems.forEach(it => {
                    if (!this.selectedIds.includes(it.id)) {
                        this.selectedIds.push(it.id);
                    }
                });
                this.renderGrid();
            };
        });

        container.querySelectorAll('.btn-deselect-group-all').forEach(btn => {
            btn.onclick = () => {
                const dateKey = btn.dataset.date;
                const groupItems = groups[dateKey] || [];
                const ids = groupItems.map(it => it.id);
                this.selectedIds = this.selectedIds.filter(id => !ids.includes(id));
                this.renderGrid();
            };
        });

        // 5. Cargar Miniaturas Asincrónicas de IndexedDB
        items.forEach(async (it) => {
            if (!it._tempImageSrc) {
                const uri = await LogiNative.getBlobUri(it.filename);
                if (uri) {
                    it._tempImageSrc = uri;
                    const img = document.getElementById(`img-${it.id}`);
                    if (img) img.src = uri;
                }
            }
        });

        // Actualizar el panel en base a la selección actual
        this.updateBatchPanel();
    }
};
