/**
 * CaptureScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Photo Capture Studio with Direct Card Editing & Project File Management
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';
import { ImageCompressor } from '../../utils/ImageCompressor.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const CaptureScreen = {
    getLayout() {
        const projName = State.currentProject?.name || 'SELECCIONAR PROYECTO';
        const catalog = State.catalog || [];

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header del Workspace -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Estación de Captura · PC Desktop</span>
                        <h1 class="text-2xl font-bold font-headline text-white" id="capture-project-title">${projName}</h1>
                    </div>
                    
                    <div class="flex gap-3">
                        <button id="btn-desktop-upload" class="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs flex items-center gap-2 glow-border active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-base">upload_file</span>
                            <span>Cargar Fotos de Galería</span>
                        </button>
                    </div>
                </div>

                <!-- Formulario de Control Rápido -->
                <div class="grid grid-cols-3 gap-6 bg-[#0a0a0c] p-5 rounded-2xl border border-white/10">
                    <div>
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">Ítem Predeterminado para Nuevas Capturas</label>
                        <select id="desktop-select-item" class="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-primary outline-none">
                            <option value="GENERAL">GENERAL (Sin ítem específico)</option>
                            ${catalog.map(c => `<option value="${c.item}">${c.item} - ${c.descripcion}</option>`).join('')}
                        </select>
                    </div>

                    <div class="col-span-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">Descripción Predeterminada</label>
                        <input id="desktop-input-desc" type="text" placeholder="Escribe un comentario por defecto (opcional)..." class="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-primary outline-none" />
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
                    <button id="btn-close-zoom-modal" class="absolute top-4 right-4 text-white/60 hover:text-white bg-black/60 p-2 rounded-full border border-white/10">
                        <span class="material-symbols-outlined text-xl">close</span>
                    </button>
                    <img id="zoom-modal-img" class="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/10" src="" alt="Vista Previa" />
                    <p id="zoom-modal-caption" class="text-xs font-bold text-white font-headline text-center max-w-2xl truncate"></p>
                </div>
            </div>
        `;
    },

    init() {
        this.bindEvents();
        this.renderGrid();

        State.subscribe((state, changeType) => {
            if (changeType === 'items' || changeType === 'project') {
                this.renderGrid();
            }
        });
    },

    bindEvents() {
        const btnUpload = document.getElementById('btn-desktop-upload');
        if (btnUpload) {
            btnUpload.onclick = () => this.pickFilesFromPC();
        }

        const btnCloseZoom = document.getElementById('btn-close-zoom-modal');
        const zoomModal = document.getElementById('photo-zoom-modal');
        if (btnCloseZoom && zoomModal) {
            btnCloseZoom.onclick = () => zoomModal.classList.add('hidden');
        }
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

            const activity = itemSelect ? itemSelect.value : 'GENERAL';
            const defaultDescription = descInput ? descInput.value : '';

            for (const file of files) {
                try {
                    // Extraer fecha nativa del archivo EXIF / lastModified
                    const photoTimestamp = file.lastModified || Date.now();

                    const compressed = await ImageCompressor.compress(file, 1400, 0.75);
                    if (compressed.base64) {
                        const id = 'cap_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
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
                        await State.addItem(data);
                    }
                } catch (err) {
                    console.error("Error procesando imagen:", err);
                }
            }

            if (descInput) descInput.value = '';
        };

        input.click();
    },

    async renderGrid() {
        const container = document.getElementById('desktop-capture-groups');
        if (!container) return;

        const items = State.items;
        const catalog = State.catalog || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-3">
                    <span class="material-symbols-outlined text-4xl text-white/20">photo_library</span>
                    <p class="text-sm font-bold text-white/60">No hay fotos registradas en este proyecto</p>
                    <p class="text-xs text-white/40 max-w-md mx-auto">Usa el botón "Cargar Fotos de Galería" para agregar fotos. Se organizarán automáticamente por la fecha en que fueron tomadas.</p>
                </div>
            `;
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

        container.innerHTML = sortedGroupKeys.map(dateKey => {
            const groupItems = groups[dateKey];
            return `
                <div class="space-y-3">
                    <!-- Encabezado de la Carpeta/Día -->
                    <div class="flex items-center gap-3 border-b border-white/10 pb-2">
                        <span class="material-symbols-outlined text-primary text-lg">calendar_today</span>
                        <h3 class="font-headline font-bold text-sm text-white tracking-wide">${dateKey}</h3>
                        <span class="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">${groupItems.length} Evidencias</span>
                    </div>

                    <!-- Cuadrícula de Tarjetas Editables -->
                    <div class="grid grid-cols-3 gap-5">
                        ${groupItems.map(it => `
                            <div class="bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 space-y-3 group hover:border-primary/40 transition-all flex flex-col justify-between">
                                <div class="space-y-3">
                                    <!-- Foto con Botón de Zoom -->
                                    <div class="w-full h-48 bg-black rounded-xl overflow-hidden relative border border-white/5 group-hover:shadow-lg transition-all cursor-pointer btn-zoom-photo" data-id="${it.id}">
                                        <img id="img-${it.id}" class="w-full h-full object-cover" src="${it._tempImageSrc || ''}" alt="Evidencia" />
                                        <span class="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white/70">${it.timeStr || ''}</span>
                                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white gap-2 font-bold text-xs">
                                            <span class="material-symbols-outlined text-xl">zoom_in</span>
                                            <span>Ampliar Foto</span>
                                        </div>
                                    </div>

                                    <!-- Campo Editable: Descripción Directa -->
                                    <div>
                                        <label class="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Descripción Técnica</label>
                                        <input type="text" data-id="${it.id}" class="input-card-desc w-full bg-black/50 border border-white/10 focus:border-primary rounded-xl px-3 py-2 text-xs text-white outline-none transition-all" value="${it.descripcion || ''}" placeholder="Escribe la descripción..." />
                                    </div>

                                    <!-- Campo Editable: Selector de Ítem / Actividad -->
                                    <div>
                                        <label class="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Ítem / Actividad Asignada</label>
                                        <select data-id="${it.id}" class="select-card-act w-full bg-black/50 border border-white/10 focus:border-primary rounded-xl px-3 py-2 text-xs text-white outline-none transition-all">
                                            <option value="GENERAL" ${it.actividad === 'GENERAL' ? 'selected' : ''}>GENERAL</option>
                                            ${catalog.map(c => `<option value="${c.item}" ${it.actividad === c.item ? 'selected' : ''}>${c.item} - ${c.descripcion}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>

                                <!-- Footer Tarjeta con Estado e Indicadores -->
                                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono text-white/40">
                                    <span id="save-status-${it.id}" class="text-emerald-400 font-bold hidden">Guardado ✓</span>
                                    <button class="btn-delete-card-photo text-rose-400 hover:text-rose-300 font-bold hover:underline transition-all" data-id="${it.id}" data-file="${it.filename}">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Vincular Eventos de Edición Instantánea en Tarjetas
        container.querySelectorAll('.input-card-desc').forEach(input => {
            input.oninput = (e) => {
                const id = input.dataset.id;
                const val = e.target.value;
                State.updateItem(id, { descripcion: val });
                const statusSpan = document.getElementById(`save-status-${id}`);
                if (statusSpan) {
                    statusSpan.classList.remove('hidden');
                    setTimeout(() => statusSpan.classList.add('hidden'), 1500);
                }
            };
        });

        container.querySelectorAll('.select-card-act').forEach(select => {
            select.onchange = (e) => {
                const id = select.dataset.id;
                const val = e.target.value;
                State.updateItem(id, { actividad: val });
                const statusSpan = document.getElementById(`save-status-${id}`);
                if (statusSpan) {
                    statusSpan.classList.remove('hidden');
                    setTimeout(() => statusSpan.classList.add('hidden'), 1500);
                }
            };
        });

        container.querySelectorAll('.btn-delete-card-photo').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("¿Estás seguro de eliminar esta evidencia?")) {
                    await State.deleteItem(btn.dataset.id, btn.dataset.file);
                }
            };
        });

        // Modal Zoom Foto
        const zoomModal = document.getElementById('photo-zoom-modal');
        const zoomImg = document.getElementById('zoom-modal-img');
        const zoomCaption = document.getElementById('zoom-modal-caption');

        container.querySelectorAll('.btn-zoom-photo').forEach(div => {
            div.onclick = async () => {
                const id = div.dataset.id;
                const item = State.items.find(i => i.id === id);
                if (item && zoomModal && zoomImg) {
                    const src = item._tempImageSrc || await LogiNative.getBlobUri(item.filename);
                    zoomImg.src = src;
                    if (zoomCaption) zoomCaption.textContent = `${item.actividad} · ${item.descripcion || 'Sin Descripción'}`;
                    zoomModal.classList.remove('hidden');
                }
            };
        });

        // Cargar miniaturas dinámicamente si falta `_tempImageSrc`
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
    }
};
