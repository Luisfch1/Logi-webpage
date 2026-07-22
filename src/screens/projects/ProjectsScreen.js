/**
 * ProjectsScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Office-Style Project Dashboard: Slim Toolbar & Tabbed Catalog Editor
 */
import { State } from '../../core/State.js';
import { Architect } from '../../core/Architect.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';
import { LogiNative } from '../../core/LogiNative.js';
import * as XLSX from 'xlsx';

export const ProjectsScreen = {
    leftTab: 'projects', // 'projects' o 'catalog'

    getLayout() {
        const projects = State.projects || [];
        const currentProject = State.currentProject;
        const allItems = State._allItems || [];

        // Asegurar consistencia de pestañas
        if (currentProject && !this.leftTab) {
            this.leftTab = 'catalog';
        } else if (!currentProject) {
            this.leftTab = 'projects';
        }

        // --- Renderizar Pestaña Izquierda: Catálogo ---
        const renderCatalogTab = () => {
            const activeCatalog = State.catalog || [];
            return `
                <div class="flex flex-col h-full space-y-4">
                    <!-- Creador de Ítem Manual (Inline Form) -->
                    <div class="bg-black/60 p-3.5 border border-white/10 rounded-xl space-y-3 shrink-0">
                        <span class="text-[9px] font-mono font-bold text-primary uppercase tracking-widest block">Agregar Ítem Manual</span>
                        <div class="flex gap-2">
                            <input id="new-item-code" type="text" placeholder="Código (ej. 4.1)" class="w-1/3 bg-black border border-white/5 rounded-lg px-2.5 py-2 text-xs text-white uppercase focus:border-primary outline-none" />
                            <input id="new-item-desc" type="text" placeholder="Descripción de actividad..." class="flex-1 bg-black border border-white/5 rounded-lg px-2.5 py-2 text-xs text-white focus:border-primary outline-none" />
                            <button id="btn-add-item-manual" class="px-3.5 rounded-lg bg-primary text-black font-bold text-xs hover:shadow active:scale-95 transition-all cursor-pointer">+</button>
                        </div>
                    </div>

                    <!-- Listado de Ítems del Catálogo -->
                    <div class="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
                        ${activeCatalog.length === 0 ? `
                            <div class="h-40 flex flex-col items-center justify-center text-center p-4 space-y-1.5">
                                <span class="material-symbols-outlined text-xl text-white/20">format_list_bulleted</span>
                                <p class="text-xs text-white/40 font-bold">Catálogo de Ítems Vacío</p>
                                <p class="text-[9px] text-white/30 max-w-[200px] leading-normal">Carga un JSON / Excel desde la barra de herramientas o agrega uno manual.</p>
                            </div>
                        ` : activeCatalog.map(c => `
                            <div class="flex items-center justify-between gap-3 p-2 bg-black/40 border border-white/5 rounded-lg text-xs hover:border-white/15 transition-all group">
                                <div class="flex-1 min-w-0 flex items-start gap-2.5">
                                    <span class="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-[10px] shrink-0 mt-0.5">${c.item}</span>
                                    <span class="text-white/80 font-body truncate leading-relaxed select-text" title="${c.descripcion}">${c.descripcion}</span>
                                </div>
                                <button class="btn-delete-catalog-item text-white/30 hover:text-rose-400 font-bold transition-all p-1 cursor-pointer" data-code="${c.item}" title="Eliminar Ítem">
                                    <span class="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        };

        // --- Renderizar Pestaña Izquierda: Proyectos ---
        const renderProjectsTab = () => {
            const projectsListHtml = projects.map(p => {
                const isActive = p.id === currentProject?.id;
                const projItems = allItems.filter(i => i.projectId === p.id || i._pnname === p.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
                const photoCount = projItems.length;

                return `
                    <div class="p-3 rounded-xl border flex items-center justify-between transition-all ${isActive ? 'bg-primary/15 border-primary/40 ring-1 ring-primary/25' : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-black/45'}" data-id="${p.id}">
                        <div class="flex-1 min-w-0 pr-3 cursor-pointer btn-select-proj" data-id="${p.id}">
                            <h4 class="text-xs font-bold text-white truncate font-headline tracking-wide uppercase">${p.name}</h4>
                            <div class="flex gap-2 text-[9px] font-mono text-white/40 mt-1">
                                <span>ID: ${p.id.substring(0, 10)}...</span>
                                <span>•</span>
                                <span class="${photoCount > 0 ? 'text-primary' : 'text-white/30'}">${photoCount} fotos</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button class="btn-rename-proj p-1 text-white/40 hover:text-white rounded hover:bg-white/5 transition-all cursor-pointer" data-id="${p.id}" data-name="${p.name}" title="Cambiar Nombre">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            ${projects.length > 1 ? `
                                <button class="btn-delete-proj p-1 text-white/40 hover:text-rose-400 rounded hover:bg-white/5 transition-all cursor-pointer" data-id="${p.id}" data-name="${p.name}" title="Eliminar Proyecto">
                                    <span class="material-symbols-outlined text-base">delete</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="flex flex-col h-full space-y-4">
                    <!-- Crear Proyecto Rápido -->
                    <div class="flex border border-white/10 rounded-xl overflow-hidden bg-black/60 focus-within:border-primary/50 transition-all shrink-0">
                        <input id="new-proj-name" type="text" placeholder="Escribe el nombre del proyecto..." class="bg-transparent px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none flex-1 uppercase" />
                        <button id="btn-create-proj" class="px-3.5 bg-white/10 hover:bg-white/20 text-white border-l border-white/10 font-bold text-xs transition-all active:scale-95 cursor-pointer">
                            Crear
                        </button>
                    </div>

                    <!-- Lista de Proyectos -->
                    <div class="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                        ${projectsListHtml}
                    </div>
                </div>
            `;
        };

        // --- Renderizar Panel de Trabajo Derecho ---
        const renderMainWorkspace = () => {
            if (!currentProject) {
                return `
                    <div class="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 select-none">
                        <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                            <span class="material-symbols-outlined text-2xl">token</span>
                        </div>
                        <div class="space-y-1.5">
                            <h3 class="text-sm font-bold font-headline text-white tracking-wide uppercase">Ningún Proyecto Abierto</h3>
                            <p class="text-[11px] text-white/40 max-w-sm mx-auto leading-relaxed">Selecciona un proyecto de la lista izquierda, crea uno nuevo o importa un archivo de extensión .logi desde el menú Archivo para comenzar a trabajar.</p>
                        </div>
                        <button id="btn-open-proj-file-empty" class="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-sm">folder_open</span>
                            <span>Importar Proyecto (.logi)</span>
                        </button>
                    </div>
                `;
            }

            const activeProjItems = allItems.filter(i => i.projectId === currentProject.id || i._pnname === currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, ''));

            return `
                <div class="flex flex-col h-full space-y-5 min-h-0">
                    <!-- Encabezado de Identificación del Proyecto Activo -->
                    <div class="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <h2 class="text-base font-bold font-headline text-white uppercase tracking-wide">${currentProject.name}</h2>
                                <button id="btn-rename-active-proj" class="p-1 text-white/40 hover:text-white rounded hover:bg-white/5 transition-all cursor-pointer" data-id="${currentProject.id}" data-name="${currentProject.name}" title="Editar Nombre">
                                    <span class="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <p class="text-[9px] font-mono text-white/30">BD LOCAL • ID: ${currentProject.id} • CREADO: ${new Date(currentProject.createdAt).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div class="flex items-center gap-4 text-[10px] font-mono text-white/50 bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg">
                            <span>Evidencias: <strong class="text-white">${activeProjItems.length}</strong></span>
                            <span>|</span>
                            <span>Ítems: <strong class="text-white">${State.catalog?.length || 0}</strong></span>
                        </div>
                    </div>

                    <!-- Vista Previa de Evidencias (Widescreen Thumbnail Board) -->
                    <div class="flex-1 flex flex-col min-h-0 space-y-2">
                        <h4 class="text-[10px] font-bold font-headline uppercase tracking-widest text-white/40 shrink-0">Evidencias en este Proyecto</h4>
                        
                        <div class="flex-1 overflow-y-auto min-h-0 bg-black/30 border border-white/5 rounded-xl p-4">
                            ${activeProjItems.length === 0 ? `
                                <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-1.5">
                                    <span class="material-symbols-outlined text-xl text-white/20">photo_library</span>
                                    <p class="text-xs text-white/40 font-bold">No hay evidencias registradas</p>
                                    <p class="text-[9px] text-white/30 max-w-xs leading-normal">Ve a la pestaña "Captura de Evidencias" para subir fotos del PC.</p>
                                </div>
                            ` : `
                                <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                    ${activeProjItems.map(it => `
                                        <div class="relative aspect-video bg-black border border-white/10 rounded-lg overflow-hidden group cursor-pointer transition-all hover:border-primary/50 btn-zoom-preview-photo" data-id="${it.id}">
                                            <!-- Imagen -->
                                            <img id="prev-img-${it.id}" class="w-full h-full object-cover select-none pointer-events-none" src="${it._tempImageSrc || ''}" alt="Preview" />
                                            
                                            <!-- Capa Hover con Detalles -->
                                            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-all select-none pointer-events-none">
                                                <div class="flex justify-between items-center w-full pointer-events-auto">
                                                    <span class="text-[8px] font-mono text-white/60 bg-black/60 px-1 py-0.5 rounded border border-white/10">${it.timeStr || ''}</span>
                                                    <button class="btn-delete-preview-photo p-0.5 text-white/60 hover:text-rose-400 rounded transition-all hover:bg-white/10" data-id="${it.id}" data-file="${it.filename}" title="Eliminar Foto">
                                                        <span class="material-symbols-outlined text-[13px]">delete</span>
                                                    </button>
                                                </div>
                                                <span class="text-[8px] font-mono font-bold bg-primary/20 text-primary border border-primary/20 px-1 py-0.5 rounded truncate max-w-full">${it.actividad || 'GENERAL'}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        };

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-5">
                <!-- Barra de Herramientas Estilo Office (Slim Top Toolbar) -->
                <div class="flex flex-wrap items-center justify-between bg-[#0a0a0c] border border-white/10 px-4 py-2.5 rounded-xl shrink-0 text-xs gap-4 shadow-lg select-none">
                    <!-- Grupo Archivo -->
                    <div class="flex items-center gap-2">
                        <span class="text-white/40 font-mono text-[9px] uppercase tracking-wider mr-2">Archivo:</span>
                        <button id="btn-menu-new" class="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-1 cursor-pointer">
                            <span class="material-symbols-outlined text-[13px]">add</span>
                            <span>Nuevo</span>
                        </button>
                        <button id="btn-menu-open" class="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-1 cursor-pointer">
                            <span class="material-symbols-outlined text-[13px]">folder_open</span>
                            <span>Abrir (.logi)</span>
                        </button>
                        ${currentProject ? `
                            <button id="btn-menu-save" class="px-2.5 py-1.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold transition-all flex items-center gap-1 cursor-pointer">
                                <span class="material-symbols-outlined text-[13px] font-bold">save</span>
                                <span>Guardar (.logi)</span>
                            </button>
                            <button id="btn-menu-close" class="px-2.5 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold transition-all flex items-center gap-1 cursor-pointer">
                                <span class="material-symbols-outlined text-[13px]">logout</span>
                                <span>Cerrar</span>
                            </button>
                        ` : ''}
                    </div>

                    <!-- Grupo Catálogo -->
                    ${currentProject ? `
                        <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4">
                            <span class="text-white/40 font-mono text-[9px] uppercase tracking-wider mr-2">Catálogo:</span>
                            <button id="btn-menu-upload-catalog" class="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-1 cursor-pointer" title="Cargar archivo JSON o Excel">
                                <span class="material-symbols-outlined text-[13px]">upload</span>
                                <span>Cargar JSON / Excel</span>
                            </button>
                            <button id="btn-menu-clear-catalog" class="px-2.5 py-1.5 rounded bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-all flex items-center gap-1 cursor-pointer">
                                <span class="material-symbols-outlined text-[13px]">delete</span>
                                <span>Limpiar</span>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Estructura de Trabajo -->
                <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    <!-- COLUMNA IZQUIERDA: Pestañas de Navegación -->
                    <div class="col-span-4 flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden min-h-0">
                        <!-- TABS DE NAVEGACIÓN -->
                        <div class="flex border-b border-white/10 bg-black/40 shrink-0 text-xs select-none">
                            <button id="tab-left-catalog" class="flex-1 py-3 text-center font-bold border-r border-white/10 transition-all cursor-pointer ${this.leftTab === 'catalog' ? 'bg-[#0a0a0c] text-primary border-b border-b-[#0a0a0c]' : 'text-white/40 hover:text-white hover:bg-white/5'}" ${!currentProject ? 'disabled' : ''}>
                                Catálogo Ítems
                            </button>
                            <button id="tab-left-projects" class="flex-1 py-3 text-center font-bold transition-all cursor-pointer ${this.leftTab === 'projects' ? 'bg-[#0a0a0c] text-primary border-b border-b-[#0a0a0c]' : 'text-white/40 hover:text-white hover:bg-white/5'}">
                                Proyectos Workspace
                            </button>
                        </div>

                        <!-- CONTENIDO DE LA PESTAÑA -->
                        <div class="flex-1 p-4 overflow-y-auto min-h-0">
                            ${this.leftTab === 'catalog' && currentProject ? renderCatalogTab() : renderProjectsTab()}
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: Visor Principal -->
                    <div class="col-span-8 h-full bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col min-h-0">
                        ${renderMainWorkspace()}
                    </div>
                </div>
            </div>

            <!-- MODAL DE ZOOM DE FOTO -->
            <div id="photo-zoom-modal" class="hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 select-none">
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
        this.leftTab = State.currentProject ? 'catalog' : 'projects';
        this.bindEvents();

        State.subscribe((state, changeType) => {
            if (changeType === 'project' || changeType === 'projects') {
                if (state.currentProject && this.leftTab !== 'catalog') {
                    this.leftTab = 'catalog';
                } else if (!state.currentProject) {
                    this.leftTab = 'projects';
                }
                Architect.render('projects');
            }
        });
    },

    bindEvents() {
        // --- Eventos Barra de Herramientas Superior ---
        const btnMenuNew = document.getElementById('btn-menu-new');
        if (btnMenuNew) {
            btnMenuNew.onclick = async () => {
                const name = prompt("Escribe el nombre del nuevo proyecto:");
                if (name && name.trim()) {
                    await State.createProject(name.trim());
                }
            };
        }

        const handleImport = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.logi, .logiproject, .zip';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) ProjectFileManager.importLogiProject(file);
            };
            input.click();
        };

        const btnMenuOpen = document.getElementById('btn-menu-open');
        if (btnMenuOpen) btnMenuOpen.onclick = handleImport;

        const btnOpenFileEmpty = document.getElementById('btn-open-proj-file-empty');
        if (btnOpenFileEmpty) btnOpenFileEmpty.onclick = handleImport;

        const btnMenuSave = document.getElementById('btn-menu-save');
        if (btnMenuSave) {
            btnMenuSave.onclick = () => ProjectFileManager.exportLogiProject();
        }

        const btnMenuClose = document.getElementById('btn-menu-close');
        if (btnMenuClose) {
            btnMenuClose.onclick = async () => {
                await State.closeProject();
            };
        }

        const btnMenuUploadCatalog = document.getElementById('btn-menu-upload-catalog');
        if (btnMenuUploadCatalog) {
            btnMenuUploadCatalog.onclick = () => this.triggerCatalogUpload();
        }

        const btnMenuClearCatalog = document.getElementById('btn-menu-clear-catalog');
        if (btnMenuClearCatalog) {
            btnMenuClearCatalog.onclick = async () => {
                if (confirm("¿Estás seguro de eliminar todo el catálogo de ítems de este proyecto?")) {
                    await State.clearCatalog(State.currentProject.id);
                }
            };
        }

        // --- Eventos Pestañas de la Columna Izquierda ---
        const tabCatalog = document.getElementById('tab-left-catalog');
        if (tabCatalog) {
            tabCatalog.onclick = () => {
                this.leftTab = 'catalog';
                Architect.render('projects');
            };
        }

        const tabProjects = document.getElementById('tab-left-projects');
        if (tabProjects) {
            tabProjects.onclick = () => {
                this.leftTab = 'projects';
                Architect.render('projects');
            };
        }

        // --- Editor de Catálogo Manual (Agregar / Eliminar Ítems) ---
        const btnAddItem = document.getElementById('btn-add-item-manual');
        if (btnAddItem) {
            btnAddItem.onclick = async () => {
                const codeInput = document.getElementById('new-item-code');
                const descInput = document.getElementById('new-item-desc');
                if (codeInput && descInput) {
                    const code = codeInput.value.trim().toUpperCase();
                    const desc = descInput.value.trim();

                    if (!code || !desc) {
                        alert("Escribe el código y la descripción del ítem.");
                        return;
                    }

                    if (State.catalog.some(c => c.item === code)) {
                        alert(`El código de ítem "${code}" ya existe en este proyecto.`);
                        return;
                    }

                    const updated = [...State.catalog, { item: code, descripcion: desc }];
                    await State.updateCatalog(State.currentProject.id, updated);
                }
            };
        }

        document.querySelectorAll('.btn-delete-catalog-item').forEach(btn => {
            btn.onclick = async () => {
                const code = btn.dataset.code;
                if (confirm(`¿Estás seguro de eliminar el ítem "${code}" del catálogo?`)) {
                    const updated = State.catalog.filter(c => c.item !== code);
                    await State.updateCatalog(State.currentProject.id, updated);
                }
            };
        });

        // --- Operaciones de Workspace ---
        const btnCreateProj = document.getElementById('btn-create-proj');
        const inputName = document.getElementById('new-proj-name');

        if (btnCreateProj && inputName) {
            const handleCreate = async () => {
                const val = inputName.value.trim();
                if (val) {
                    await State.createProject(val);
                    inputName.value = '';
                } else {
                    alert("Ingresa un nombre para el proyecto.");
                }
            };
            btnCreateProj.onclick = handleCreate;
            inputName.onkeydown = (e) => {
                if (e.key === 'Enter') handleCreate();
            };
        }

        document.querySelectorAll('.btn-select-proj').forEach(btn => {
            btn.onclick = async () => {
                const proj = State.projects.find(p => p.id === btn.dataset.id);
                if (proj) {
                    await State.setCurrentProject(proj);
                }
            };
        });

        // Renombrar e importar desde grilla
        document.querySelectorAll('.btn-rename-proj').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const oldName = btn.dataset.name;
                const newName = prompt(`Cambiar nombre al proyecto "${oldName}":`, oldName);
                if (newName && newName.trim() && newName.trim().toUpperCase() !== oldName) {
                    await State.updateProject(id, newName.trim());
                }
            };
        });

        const btnRenameActiveProj = document.getElementById('btn-rename-active-proj');
        if (btnRenameActiveProj) {
            btnRenameActiveProj.onclick = async () => {
                const id = btnRenameActiveProj.dataset.id;
                const oldName = btnRenameActiveProj.dataset.name;
                const newName = prompt(`Cambiar nombre al proyecto "${oldName}":`, oldName);
                if (newName && newName.trim() && newName.trim().toUpperCase() !== oldName) {
                    await State.updateProject(id, newName.trim());
                }
            };
        }

        document.querySelectorAll('.btn-delete-proj').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                if (confirm(`¿Estás seguro de eliminar el proyecto "${name}"? Se borrarán sus datos asociados.`)) {
                    await State.deleteProject(id);
                }
            };
        });

        // --- Eventos del Visualizador de Evidencias (Derecha) ---
        const zoomModal = document.getElementById('photo-zoom-modal');
        const zoomImg = document.getElementById('zoom-modal-img');

        document.querySelectorAll('.btn-zoom-preview-photo').forEach(card => {
            card.onclick = async (e) => {
                if (e.target.closest('.btn-delete-preview-photo')) return;

                const id = card.dataset.id;
                const item = State.items.find(i => i.id === id);
                if (item && zoomModal && zoomImg) {
                    const src = item._tempImageSrc || await LogiNative.getBlobUri(item.filename);
                    zoomImg.src = src;
                    
                    const itemEl = document.getElementById('zoom-modal-item');
                    const descEl = document.getElementById('zoom-modal-desc');
                    
                    const catalog = State.catalog || [];
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

        document.querySelectorAll('.btn-delete-preview-photo').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const filename = btn.dataset.file;
                if (confirm("¿Estás seguro de eliminar esta evidencia del disco?")) {
                    await State.deleteItem(id, filename);
                }
            };
        });

        const btnCloseZoom = document.getElementById('btn-close-zoom-modal');
        if (btnCloseZoom && zoomModal) {
            btnCloseZoom.onclick = () => zoomModal.classList.add('hidden');
        }

        // Cargar miniaturas de previsualización
        if (State.currentProject) {
            const activeProjItems = State.items;
            activeProjItems.forEach(async (it) => {
                if (!it._tempImageSrc) {
                    const uri = await LogiNative.getBlobUri(it.filename);
                    if (uri) {
                        it._tempImageSrc = uri;
                        const img = document.getElementById(`prev-img-${it.id}`);
                        if (img) img.src = uri;
                    }
                }
            });
        }
    },

    triggerCatalogUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json, .xlsx, .xls';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

            if (isExcel) {
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    try {
                        const data = evt.target.result;
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                        const cleanItems = rawRows.map(row => {
                            const itemKey = Object.keys(row).find(k => k.toUpperCase() === 'ITEM' || k.toUpperCase() === 'CODIGO' || k.toUpperCase() === 'COD') || Object.keys(row)[0];
                            const descKey = Object.keys(row).find(k => k.toUpperCase() === 'DESCRIPCION' || k.toUpperCase() === 'DESCRIPCIÓN' || k.toUpperCase() === 'NOMBRE' || k.toUpperCase() === 'DETALLE') || Object.keys(row)[1];

                            if (itemKey && row[itemKey] !== undefined && row[itemKey] !== "") {
                                const itemCode = String(row[itemKey]).trim();
                                const itemDesc = descKey ? String(row[descKey] || '').trim() : '';
                                return {
                                    item: itemCode,
                                    descripcion: itemDesc || 'Sin descripción'
                                };
                            }
                            return null;
                        }).filter(Boolean);

                        if (cleanItems.length > 0) {
                            await State.updateCatalog(State.currentProject.id, cleanItems);
                            alert(`¡Catálogo Excel cargado con éxito! Se importaron ${cleanItems.length} actividades.`);
                        } else {
                            alert("No se encontraron registros válidos en la primera hoja del archivo Excel. Asegúrate de tener columnas llamadas 'ITEM' y 'DESCRIPCION'.");
                        }
                    } catch (err) {
                        alert("Error al procesar el archivo Excel: " + err.message);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    try {
                        const parsed = JSON.parse(evt.target.result);
                        const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.catalog || []);
                        const cleanItems = items.map(it => {
                            if (typeof it === 'object' && it.item) {
                                return {
                                    item: String(it.item).trim(),
                                    descripcion: String(it.descripcion || it.desc || '').trim()
                                };
                            }
                            return null;
                        }).filter(Boolean);

                        if (cleanItems.length > 0) {
                            await State.updateCatalog(State.currentProject.id, cleanItems);
                            alert(`¡Catálogo cargado con éxito! Se cargaron ${cleanItems.length} actividades.`);
                        } else {
                            alert("El archivo JSON no contiene un catálogo válido. Formato esperado: [{item: 'código', descripcion: 'nombre'}]");
                        }
                    } catch (err) {
                        alert("Error al leer el archivo JSON: " + err.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
};
