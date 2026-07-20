/**
 * GalleryScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Gallery & Search Workspace with 4-6 Column Desktop Grid
 */
import { State } from '../../core/State.js';
import { LogiNative } from '../../core/LogiNative.js';

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

                    <!-- Buscador Multifunción -->
                    <div class="relative w-96">
                        <span class="material-symbols-outlined absolute left-3 top-3 text-white/40 text-lg">search</span>
                        <input id="gallery-search-input" type="text" placeholder="Filtrar por descripción o ítem..." value="${this.searchTerm}" class="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary outline-none" />
                    </div>
                </div>

                <!-- Grid Galería Desktop (4 Columnas) -->
                <div class="flex-1 overflow-y-auto">
                    <div id="desktop-gallery-grid" class="grid grid-cols-4 gap-5">
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
    },

    async renderGrid() {
        const grid = document.getElementById('desktop-gallery-grid');
        if (!grid) return;

        let items = State.items;

        if (this.searchTerm) {
            items = items.filter(it => {
                const desc = String(it.descripcion || '').toLowerCase();
                const act = String(it.actividad || '').toLowerCase();
                return desc.includes(this.searchTerm) || act.includes(this.searchTerm);
            });
        }

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-span-4 p-16 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-2">
                    <span class="material-symbols-outlined text-4xl text-white/20">search_off</span>
                    <p class="text-xs text-white/40 italic">No se encontraron evidencias coincidentes.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(it => `
            <div class="bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 space-y-3 group hover:border-primary/50 transition-all">
                <div class="w-full h-52 bg-black rounded-xl overflow-hidden relative border border-white/5">
                    <img id="gal-img-${it.id}" class="w-full h-full object-cover" src="${it._tempImageSrc || ''}" alt="Foto" />
                    <span class="absolute top-2 left-2 bg-primary/20 text-primary border border-primary/40 px-2 py-0.5 rounded text-[9px] font-bold">${it.actividad}</span>
                </div>

                <div class="space-y-1">
                    <p class="text-xs font-bold text-white truncate">${it.descripcion || 'Sin Descripción'}</p>
                    <p class="text-[9px] text-white/40 font-mono">${it.fechaStr || ''} - ${it.timeStr || ''}</p>
                </div>

                <button class="btn-delete-gal-photo text-xs font-bold text-rose-400 hover:text-rose-300 w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all" data-id="${it.id}" data-file="${it.filename}">
                    Eliminar Evidencia
                </button>
            </div>
        `).join('');

        grid.querySelectorAll('.btn-delete-gal-photo').forEach(btn => {
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
