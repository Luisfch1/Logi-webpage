/**
 * CaptureScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Photo Capture Studio for Laptop/PC Desktop
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';
import { ImageCompressor } from '../../utils/ImageCompressor.js';

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
                        <button id="btn-desktop-camera" class="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs flex items-center gap-2 glow-border active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-base">photo_camera</span>
                            <span>Tomar Foto (Webcam)</span>
                        </button>
                        <button id="btn-desktop-upload" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-base">upload_file</span>
                            <span>Cargar Fotos de Galería</span>
                        </button>
                    </div>
                </div>

                <!-- Formulario de Control e Ítem -->
                <div class="grid grid-cols-3 gap-6 bg-[#0a0a0c] p-6 rounded-2xl border border-white/10">
                    <div>
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Actividad / Ítem Asignado</label>
                        <select id="desktop-select-item" class="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none">
                            <option value="GENERAL">GENERAL (Sin ítem específico)</option>
                            ${catalog.map(c => `<option value="${c.item}">${c.item} - ${c.descripcion}</option>`).join('')}
                        </select>
                    </div>

                    <div class="col-span-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Descripción Técnica de la Captura</label>
                        <input id="desktop-input-desc" type="text" placeholder="Escribe la descripción o comentarios de la evidencia..." class="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none" />
                    </div>
                </div>

                <!-- Cuadrícula Panorámica de Capturas Recientes -->
                <div class="flex-1 overflow-y-auto space-y-3">
                    <h3 class="font-headline text-xs font-bold text-white/60 uppercase tracking-widest">Capturas Recientes del Proyecto (${State.items.length})</h3>
                    <div id="desktop-capture-grid" class="grid grid-cols-4 gap-4">
                        <!-- Inyectado por renderGrid() -->
                    </div>
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

        const btnCamera = document.getElementById('btn-desktop-camera');
        if (btnCamera) {
            btnCamera.onclick = () => this.pickFilesFromPC(true);
        }
    },

    pickFilesFromPC(isCamera = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (isCamera) input.capture = 'environment';
        else input.multiple = true;

        input.onchange = async (e) => {
            const files = Array.from(e.target.files || []);
            const itemSelect = document.getElementById('desktop-select-item');
            const descInput = document.getElementById('desktop-input-desc');

            const activity = itemSelect ? itemSelect.value : 'GENERAL';
            const description = descInput ? descInput.value : '';

            for (const file of files) {
                try {
                    const compressed = await ImageCompressor.compress(file, 1400, 0.75);
                    if (compressed.base64) {
                        const id = 'cap_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                        const filename = id + '.jpg';

                        const data = {
                            id,
                            descripcion: description,
                            actividad: activity,
                            createdAt: Date.now(),
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
        const grid = document.getElementById('desktop-capture-grid');
        if (!grid) return;

        const items = State.items;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-span-4 p-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2">
                    <span class="material-symbols-outlined text-4xl text-white/20">photo_library</span>
                    <p class="text-xs text-white/40 italic">No hay fotos registradas en este proyecto.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(it => `
            <div class="bg-[#0a0a0c] border border-white/10 rounded-2xl p-3 space-y-3 group hover:border-primary/50 transition-all">
                <div class="w-full h-44 bg-black rounded-xl overflow-hidden relative border border-white/5">
                    <img id="img-${it.id}" class="w-full h-full object-cover" src="${it._tempImageSrc || ''}" alt="Evidencia" />
                    <span class="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white/70">${it.timeStr || ''}</span>
                    <span class="absolute top-2 left-2 bg-primary/20 text-primary border border-primary/40 px-2 py-0.5 rounded text-[9px] font-bold">${it.actividad}</span>
                </div>
                <div class="space-y-1">
                    <p class="text-xs text-white font-medium truncate">${it.descripcion || 'Sin descripción'}</p>
                    <p class="text-[9px] text-white/40 font-mono">${it.fechaStr || ''}</p>
                </div>
            </div>
        `).join('');

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
