/**
 * GalleryScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Gallery Workspace grouped by Day with Live Search & Editable Cards
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const GalleryScreen = {
    searchTerm: '',

    getLayout() {
        const items = State.items;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header Galería Desktop -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Galería de Evidencias Panorámica</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Galería de Fotos (${items.length})</h1>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="relative w-80">
                            <span class="material-symbols-outlined absolute left-3 top-2.5 text-white/40 text-lg">search</span>
                            <input id="gallery-search-input" type="text" placeholder="Filtrar por descripción o ítem..." value="${this.searchTerm}" class="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-primary outline-none" />
                        </div>

                        <button id="btn-gal-save-logiproject" class="px-3.5 py-2 rounded-xl bg-primary text-black font-bold text-xs flex items-center gap-2 glow-border active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">save</span>
                            <span>Guardar Proyecto</span>
                        </button>
                    </div>
                </div>

                <!-- Grid Galería Desktop Agrupada por Día -->
                <div class="flex-1 overflow-y-auto space-y-6 pr-1">
                    <div id="desktop-gallery-groups" class="space-y-6">
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
        const inputSearch = document.getElementById('gallery-search-input');
        if (inputSearch) {
            inputSearch.oninput = (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.renderGrid();
            };
        }

        const btnSave = document.getElementById('btn-gal-save-logiproject');
        if (btnSave) {
            btnSave.onclick = () => ProjectFileManager.exportLogiProject();
        }
    },

    async renderGrid() {
        const container = document.getElementById('desktop-gallery-groups');
        if (!container) return;

        let items = State.items;
        const catalog = State.catalog || [];

        if (this.searchTerm) {
            items = items.filter(it => {
                const desc = String(it.descripcion || '').toLowerCase();
                const act = String(it.actividad || '').toLowerCase();
                return desc.includes(this.searchTerm) || act.includes(this.searchTerm);
            });
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-3">
                    <span class="material-symbols-outlined text-4xl text-white/20">search_off</span>
                    <p class="text-xs text-white/40 italic">No se encontraron evidencias coincidentes con el filtro de búsqueda.</p>
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
                    <!-- Header Día -->
                    <div class="flex items-center gap-3 border-b border-white/10 pb-2">
                        <span class="material-symbols-outlined text-primary text-lg">calendar_today</span>
                        <h3 class="font-headline font-bold text-sm text-white tracking-wide">${dateKey}</h3>
                        <span class="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">${groupItems.length} Fotos</span>
                    </div>

                    <div class="grid grid-cols-4 gap-5">
                        ${groupItems.map(it => `
                            <div class="bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 space-y-3 group hover:border-primary/40 transition-all flex flex-col justify-between">
                                <div class="space-y-3">
                                    <div class="w-full h-44 bg-black rounded-xl overflow-hidden relative border border-white/5">
                                        <img id="gal-img-${it.id}" class="w-full h-full object-cover" src="${it._tempImageSrc || ''}" alt="Foto" />
                                        <span class="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white/70">${it.timeStr || ''}</span>
                                    </div>

                                    <div>
                                        <label class="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Descripción</label>
                                        <input type="text" data-id="${it.id}" class="input-gal-desc w-full bg-black/50 border border-white/10 focus:border-primary rounded-xl px-3 py-1.5 text-xs text-white outline-none" value="${it.descripcion || ''}" placeholder="Escribe descripción..." />
                                    </div>

                                    <div>
                                        <label class="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">Ítem Asignado</label>
                                        <select data-id="${it.id}" class="select-gal-act w-full bg-black/50 border border-white/10 focus:border-primary rounded-xl px-3 py-1.5 text-xs text-white outline-none">
                                            <option value="GENERAL" ${it.actividad === 'GENERAL' ? 'selected' : ''}>GENERAL</option>
                                            ${catalog.map(c => `<option value="${c.item}" ${it.actividad === c.item ? 'selected' : ''}>${c.item} - ${c.descripcion}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
                                    <span id="gal-save-${it.id}" class="text-emerald-400 font-bold hidden">Guardado ✓</span>
                                    <button class="btn-delete-gal-photo text-rose-400 hover:text-rose-300 font-bold hover:underline" data-id="${it.id}" data-file="${it.filename}">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Eventos de edición en vivo
        container.querySelectorAll('.input-gal-desc').forEach(input => {
            input.oninput = (e) => {
                const id = input.dataset.id;
                State.updateItem(id, { descripcion: e.target.value });
                const span = document.getElementById(`gal-save-${id}`);
                if (span) {
                    span.classList.remove('hidden');
                    setTimeout(() => span.classList.add('hidden'), 1500);
                }
            };
        });

        container.querySelectorAll('.select-gal-act').forEach(select => {
            select.onchange = (e) => {
                const id = select.dataset.id;
                State.updateItem(id, { actividad: e.target.value });
                const span = document.getElementById(`gal-save-${id}`);
                if (span) {
                    span.classList.remove('hidden');
                    setTimeout(() => span.classList.add('hidden'), 1500);
                }
            };
        });

        container.querySelectorAll('.btn-delete-gal-photo').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("¿Estás seguro de eliminar esta foto?")) {
                    await State.deleteItem(btn.dataset.id, btn.dataset.file);
                }
            };
        });

        items.forEach(async (it) => {
            if (!it._tempImageSrc) {
                const uri = await LogiNative.getBlobUri(it.filename);
                if (uri) {
                    it._tempImageSrc = uri;
                    const img = document.getElementById(`gal-img-${it.id}`);
                    if (img) img.src = uri;
                }
            }
        });
    }
};
