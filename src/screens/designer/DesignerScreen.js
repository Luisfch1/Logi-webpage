/**
 * DesignerScreen.js
 * Módulo Diseñador de Esquemas por Bloques (.logifmt Builder)
 * Layout de 3 columnas (Paleta | Lienzo | Inspector) + Simulador Móvil
 */
import { State } from '../../core/State.js';

export const DesignerScreen = {
    getLayout() {
        const schema = State.currentSchema;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden">
                <!-- === BARRA SUPERIOR DEL DISEÑADOR === -->
                <header class="h-16 px-6 bg-[#0a0a0c] border-b border-white/10 flex justify-between items-center shrink-0 z-30">
                    <div class="flex items-center gap-4">
                        <span class="material-symbols-outlined text-primary text-2xl">extension</span>
                        <div>
                            <input id="input-schema-title" value="${schema.meta.title}" class="font-headline font-bold text-sm bg-transparent text-white focus:bg-white/5 px-2 py-1 rounded border border-transparent focus:border-white/20 transition-all outline-none" placeholder="Nombre del Esquema..." />
                            <p class="text-[10px] text-white/40 font-mono px-2">ID: <span class="text-primary font-bold">${schema.meta.schemaId}</span> | v${schema.meta.schemaVersion}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button id="btn-preview-mobile" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm text-primary">smartphone</span>
                            <span>Simular Móvil</span>
                        </button>
                        <button id="btn-import-logifmt" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">file_open</span>
                            <span>Cargar .logifmt</span>
                        </button>
                        <button id="btn-export-logifmt" class="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs flex items-center gap-2 glow-border active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">download</span>
                            <span>Exportar Esquema (.logifmt)</span>
                        </button>
                    </div>
                </header>

                <!-- === ZONA PRINCIPAL DE 3 COLUMNAS === -->
                <div class="flex-1 flex w-full overflow-hidden">
                    
                    <!-- 1. PALETA DE COMPONENTES PRIMITIVOS (IZQUIERDA) -->
                    <aside class="w-64 h-full bg-[#0a0a0c]/60 border-r border-white/10 p-4 space-y-4 overflow-y-auto shrink-0 select-none">
                        <div>
                            <h3 class="font-headline text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Componentes</h3>
                            <p class="text-[10px] text-white/40">Haz clic en un tipo de dato para agregarlo al lienzo.</p>
                        </div>

                        <div class="space-y-2">
                            <button data-type="text" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">notes</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Texto Libre</p>
                                    <p class="text-[9px] text-white/40">Observaciones o notas</p>
                                </div>
                            </button>

                            <button data-type="number" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">pin</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Número / Unidad</p>
                                    <p class="text-[9px] text-white/40">Mediciones (m, PSI, °C)</p>
                                </div>
                            </button>

                            <button data-type="select" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">list</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Lista Desplegable</p>
                                    <p class="text-[9px] text-white/40">Opciones fijas predefinidas</p>
                                </div>
                            </button>

                            <button data-type="boolean" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">check_box</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Verificación (Sí/No)</p>
                                    <p class="text-[9px] text-white/40">Interruptor de cumplimiento</p>
                                </div>
                            </button>

                            <button data-type="photo" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">photo_camera</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Evidencia Fotográfica</p>
                                    <p class="text-[9px] text-white/40">Captura de imágenes</p>
                                </div>
                            </button>

                            <button data-type="location" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">location_on</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Ubicación GPS</p>
                                    <p class="text-[9px] text-white/40">Coordenadas y altitud</p>
                                </div>
                            </button>

                            <button data-type="signature" class="btn-add-field w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/40 rounded-xl flex items-center gap-3 text-left transition-all group">
                                <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <span class="material-symbols-outlined text-base">draw</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-white">Firma Digital</p>
                                    <p class="text-[9px] text-white/40">Trazado táctil responsivo</p>
                                </div>
                            </button>
                        </div>
                    </aside>

                    <!-- 2. LIENZO INTERACTIVO / CANVAS (CENTRO) -->
                    <main class="flex-1 h-full bg-[#050505] p-8 overflow-y-auto">
                        <div class="max-w-3xl mx-auto space-y-6">
                            
                            <!-- Banner Encabezado del Lienzo -->
                            <div class="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-white/5 to-transparent border border-primary/20 space-y-2">
                                <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Lienzo de Captura por Bloques</span>
                                <h2 class="text-xl font-bold font-headline text-white" id="canvas-title">${schema.meta.title}</h2>
                                <p class="text-xs text-white/60">Agrega y reordena los campos requeridos para la captura en campo.</p>
                            </div>

                            <!-- Contenedor de Bloques del Esquema -->
                            <div id="fields-container" class="space-y-3">
                                <!-- Inyectado por renderFields() -->
                            </div>
                        </div>
                    </main>

                    <!-- 3. INSPECTOR DE PROPIEDADES (DERECHA) -->
                    <aside class="w-80 h-full bg-[#0a0a0c]/80 border-l border-white/10 p-5 space-y-5 overflow-y-auto shrink-0">
                        <div class="border-b border-white/10 pb-3">
                            <h3 class="font-headline text-xs font-bold text-white uppercase tracking-widest">Propiedades del Campo</h3>
                            <p class="text-[10px] text-white/40">Configura reglas y etiquetas del bloque seleccionado.</p>
                        </div>

                        <div id="inspector-content">
                            <!-- Inyectado por renderInspector() -->
                        </div>
                    </aside>
                </div>
            </div>

            <!-- MODAL SIMULADOR MÓVIL (OCULTO POR DEFECTO) -->
            <div id="mobile-preview-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div class="w-[380px] h-[720px] bg-black border-4 border-white/20 rounded-[48px] p-4 flex flex-col shadow-2xl overflow-hidden relative">
                    <!-- Dynamic Island Fake -->
                    <div class="w-28 h-5 bg-black rounded-full mx-auto mb-3 shrink-0 z-50"></div>
                    
                    <div class="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c] rounded-[32px] border border-white/10 p-4">
                        <div class="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                            <span class="font-headline font-black text-xs text-primary">LOGI MOBILE PREVIEW</span>
                            <button id="btn-close-mobile-preview" class="text-white/40 hover:text-white">
                                <span class="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div id="mobile-preview-content" class="flex-1 overflow-y-auto space-y-4 pr-1">
                            <!-- Inyectado por renderMobilePreview() -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        console.log('[DesignerScreen] Inicializando diseñador de esquemas...');
        this.bindEvents();
        this.renderFields();
        this.renderInspector();

        State.subscribe((state, changeType) => {
            if (changeType === 'fields' || changeType === 'schemaLoaded') {
                this.renderFields();
                this.renderInspector();
            } else if (changeType === 'selectField' || changeType === 'fieldUpdate') {
                this.renderFields();
                this.renderInspector();
            }
        });
    },

    bindEvents() {
        // Título del Esquema
        const inputTitle = document.getElementById('input-schema-title');
        if (inputTitle) {
            inputTitle.oninput = (e) => {
                State.currentSchema.meta.title = e.target.value;
                const canvasTitle = document.getElementById('canvas-title');
                if (canvasTitle) canvasTitle.textContent = e.target.value;
            };
        }

        // Botones de Paleta (Agregar Campos)
        document.querySelectorAll('.btn-add-field').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
                State.addField(type);
            };
        });

        // Exportar .logifmt
        const btnExport = document.getElementById('btn-export-logifmt');
        if (btnExport) {
            btnExport.onclick = () => this.exportSchema();
        }

        // Cargar .logifmt
        const btnImport = document.getElementById('btn-import-logifmt');
        if (btnImport) {
            btnImport.onclick = () => this.importSchema();
        }

        // Simulador Móvil
        const btnPreview = document.getElementById('btn-preview-mobile');
        const modalPreview = document.getElementById('mobile-preview-modal');
        const btnClosePreview = document.getElementById('btn-close-mobile-preview');

        if (btnPreview && modalPreview) {
            btnPreview.onclick = () => {
                this.renderMobilePreview();
                modalPreview.classList.remove('hidden');
            };
        }
        if (btnClosePreview && modalPreview) {
            btnClosePreview.onclick = () => modalPreview.classList.add('hidden');
        }
    },

    renderFields() {
        const container = document.getElementById('fields-container');
        if (!container) return;

        const fields = State.currentSchema.fields;

        if (fields.length === 0) {
            container.innerHTML = `
                <div class="p-12 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-3">
                    <span class="material-symbols-outlined text-4xl text-white/20">add_card</span>
                    <p class="text-sm font-bold text-white/60">El lienzo está vacío</p>
                    <p class="text-xs text-white/30 max-w-sm mx-auto">Selecciona un componente de la paleta izquierda para comenzar a construir el esquema.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = fields.map((f, idx) => {
            const isSelected = f.id === State.selectedFieldId;
            return `
                <div data-id="${f.id}" class="field-block p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-primary/10 border-primary shadow-lg' : 'bg-[#0f0f12] border-white/10 hover:border-white/30'}">
                    <div class="flex items-center gap-4">
                        <span class="text-xs font-mono text-white/30 font-bold">${idx + 1}.</span>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-sm text-white">${f.label}</span>
                                ${f.required ? '<span class="text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>' : ''}
                                ${f.unit ? `<span class="text-[9px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">[${f.unit}]</span>` : ''}
                            </div>
                            <p class="text-[10px] text-white/40 font-mono">ID: ${f.id} | Tipo: <span class="uppercase font-bold text-white/60">${f.type}</span></p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button class="btn-delete-field text-white/30 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors" data-id="${f.id}">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Re-vincular eventos de selección y borrado
        container.querySelectorAll('.field-block').forEach(block => {
            block.onclick = (e) => {
                if (e.target.closest('.btn-delete-field')) return;
                State.selectField(block.dataset.id);
            };
        });

        container.querySelectorAll('.btn-delete-field').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                State.removeField(btn.dataset.id);
            };
        });
    },

    renderInspector() {
        const container = document.getElementById('inspector-content');
        if (!container) return;

        const field = State.currentSchema.fields.find(f => f.id === State.selectedFieldId);

        if (!field) {
            container.innerHTML = `
                <div class="py-12 text-center text-white/30 italic text-xs">
                    Selecciona un campo del lienzo para inspeccionar y editar sus propiedades.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Etiqueta del Campo</label>
                    <input id="prop-label" type="text" value="${field.label}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none" />
                </div>

                <div>
                    <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Identificador Único (ID)</label>
                    <input id="prop-id" type="text" value="${field.id}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-primary outline-none" />
                </div>

                <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span class="text-xs font-bold text-white">Campo Obligatorio</span>
                    <input id="prop-required" type="checkbox" ${field.required ? 'checked' : ''} class="w-4 h-4 accent-primary cursor-pointer" />
                </div>

                ${field.type === 'number' ? `
                    <div>
                        <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Unidad de Medida</label>
                        <input id="prop-unit" type="text" value="${field.unit || ''}" placeholder="Ej: PSI, m, °C" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none" />
                    </div>
                ` : ''}

                ${(field.type === 'select' || field.type === 'multi_select') ? `
                    <div>
                        <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Opciones (Separadas por comas)</label>
                        <textarea id="prop-options" rows="3" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-primary outline-none">${(field.options || []).join(', ')}</textarea>
                    </div>
                ` : ''}

                ${field.type === 'photo' ? `
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Mín. Fotos</label>
                            <input id="prop-min-photos" type="number" value="${field.minPhotos || 1}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Máx. Fotos</label>
                            <input id="prop-max-photos" type="number" value="${field.maxPhotos || 4}" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Eventos del Inspector
        const propLabel = document.getElementById('prop-label');
        if (propLabel) propLabel.oninput = (e) => State.updateField(field.id, 'label', e.target.value);

        const propId = document.getElementById('prop-id');
        if (propId) propId.onchange = (e) => State.updateField(field.id, 'id', e.target.value.trim());

        const propReq = document.getElementById('prop-required');
        if (propReq) propReq.onchange = (e) => State.updateField(field.id, 'required', e.target.checked);

        const propUnit = document.getElementById('prop-unit');
        if (propUnit) propUnit.oninput = (e) => State.updateField(field.id, 'unit', e.target.value);

        const propOptions = document.getElementById('prop-options');
        if (propOptions) {
            propOptions.onchange = (e) => {
                const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                State.updateField(field.id, 'options', opts);
            };
        }
    },

    renderMobilePreview() {
        const container = document.getElementById('mobile-preview-content');
        if (!container) return;

        const fields = State.currentSchema.fields;

        if (fields.length === 0) {
            container.innerHTML = `<p class="text-center text-white/40 py-8 italic text-xs">No hay campos para simular.</p>`;
            return;
        }

        container.innerHTML = fields.map(f => `
            <div class="space-y-1.5 p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                <label class="font-bold text-white block">
                    ${f.label} ${f.required ? '<span class="text-rose-400">*</span>' : ''}
                </label>

                ${f.type === 'text' ? `<input disabled type="text" placeholder="Ingresa observación..." class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white/60" />` : ''}
                ${f.type === 'number' ? `<div class="flex gap-2"><input disabled type="number" placeholder="0.00" class="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white/60" /><span class="p-2 bg-primary/10 text-primary font-bold rounded-lg">${f.unit || ''}</span></div>` : ''}
                ${f.type === 'select' ? `<select disabled class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white/60">${(f.options || []).map(o => `<option>${o}</option>`).join('')}</select>` : ''}
                ${f.type === 'boolean' ? `<div class="flex items-center gap-2"><input disabled type="checkbox" class="w-4 h-4 accent-primary" /><span class="text-white/60">Cumple especificación</span></div>` : ''}
                ${f.type === 'photo' ? `<div class="p-4 border border-dashed border-primary/40 bg-primary/5 rounded-xl text-center text-primary font-bold text-[10px] uppercase">Tomar Evidencia (${f.minPhotos || 1} - ${f.maxPhotos || 4} fotos)</div>` : ''}
                ${f.type === 'location' ? `<div class="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[9px] rounded-lg">GPS: Lat 4.6097, Lon -74.0817 (Capturado)</div>` : ''}
                ${f.type === 'signature' ? `<div class="h-16 border border-dashed border-white/20 bg-black/40 rounded-lg flex items-center justify-center text-white/30 text-[10px]">Lienzo de Firma Digital</div>` : ''}
            </div>
        `).join('');
    },

    exportSchema() {
        const schema = State.currentSchema;
        const jsonStr = JSON.stringify(schema, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${schema.meta.schemaId || 'esquema'}.logifmt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importSchema() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.logifmt, .json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const parsed = JSON.parse(evt.target.result);
                        State.loadSchema(parsed);
                        alert("¡Esquema .logifmt cargado con éxito en el diseñador!");
                    } catch (err) {
                        alert("Error al leer el archivo de esquema: " + err.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
};
