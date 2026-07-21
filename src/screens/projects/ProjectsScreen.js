/**
 * ProjectsScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Two-Column Project Dashboard: Project & Catalog Management Console
 */
import { State } from '../../core/State.js';
import { Architect } from '../../core/Architect.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const ProjectsScreen = {
    getLayout() {
        const projects = State.projects || [];
        const currentProject = State.currentProject;
        const allItems = State._allItems || [];
        
        // Columna Izquierda: Listado de Proyectos del Workspace
        const projectsListHtml = projects.map(p => {
            const isActive = p.id === currentProject?.id;
            const projItems = allItems.filter(i => i.projectId === p.id || i._pnname === p.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const photoCount = projItems.length;

            return `
                <div class="p-3.5 rounded-xl border flex items-center justify-between transition-all ${isActive ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20' : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-black/40'}" data-id="${p.id}">
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

        // Columna Derecha: Detalles del Proyecto Activo o Vista de Estado Vacío
        let rightColumnHtml = '';

        if (currentProject) {
            const activeProjItems = allItems.filter(i => i.projectId === currentProject.id || i._pnname === currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const activePhotoCount = activeProjItems.length;
            const activeCatalog = State.catalog || [];

            rightColumnHtml = `
                <div class="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-6">
                    <!-- Cabecera del Proyecto Activo -->
                    <div class="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <h2 class="text-xl font-bold font-headline text-white uppercase tracking-wide" id="active-project-name">${currentProject.name}</h2>
                                <button id="btn-rename-active-proj" class="p-1 text-white/40 hover:text-white rounded hover:bg-white/5 transition-all cursor-pointer" data-id="${currentProject.id}" data-name="${currentProject.name}" title="Editar Nombre">
                                    <span class="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <p class="text-[10px] font-mono text-white/40">ID de base de datos: ${currentProject.id}</p>
                        </div>
                        <button id="btn-close-active-proj" class="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-[10px] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-xs">logout</span>
                            <span>Cerrar Proyecto</span>
                        </button>
                    </div>

                    <!-- Métricas Rápidas -->
                    <div class="grid grid-cols-3 gap-4 shrink-0">
                        <div class="bg-black/40 border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-base">photo_library</span>
                            </div>
                            <div>
                                <p class="text-[9px] font-mono text-white/40 uppercase">Evidencias</p>
                                <p class="text-sm font-bold text-white font-mono mt-0.5">${activePhotoCount}</p>
                            </div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-base">format_list_bulleted</span>
                            </div>
                            <div>
                                <p class="text-[9px] font-mono text-white/40 uppercase">Ítems Catálogo</p>
                                <p class="text-sm font-bold text-white font-mono mt-0.5">${activeCatalog.length}</p>
                            </div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-base">calendar_today</span>
                            </div>
                            <div>
                                <p class="text-[9px] font-mono text-white/40 uppercase">Fecha Creación</p>
                                <p class="text-[10px] font-bold text-white mt-0.5">${new Date(currentProject.createdAt).toLocaleDateString('es-ES')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Operaciones de Archivo de Proyecto -->
                    <div class="space-y-3 shrink-0">
                        <h4 class="text-[10px] font-bold font-headline uppercase tracking-widest text-white/50">Archivos y Transferencia</h4>
                        <div class="flex gap-3">
                            <button id="btn-save-active-proj" class="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs flex items-center justify-center gap-2 glow-border active:scale-95 transition-all cursor-pointer">
                                <span class="material-symbols-outlined text-sm font-bold">save</span>
                                <span>Exportar Proyecto (.logi)</span>
                            </button>
                            <button id="btn-open-proj-file" class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer">
                                <span class="material-symbols-outlined text-sm">folder_open</span>
                                <span>Importar Proyecto (.logi)</span>
                            </button>
                        </div>
                    </div>

                    <!-- Catálogo de Ítems / Actividades -->
                    <div class="flex-1 flex flex-col min-h-0 space-y-3">
                        <div class="flex justify-between items-center pb-2 border-b border-white/5 shrink-0">
                            <h4 class="text-[10px] font-bold font-headline uppercase tracking-widest text-white/50">Catálogo de Actividades / Ítems</h4>
                            <div class="flex gap-2">
                                <button id="btn-upload-catalog" class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] border border-white/10 flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
                                    <span class="material-symbols-outlined text-xs">upload</span>
                                    <span>Cargar JSON</span>
                                </button>
                                ${activeCatalog.length > 0 ? `
                                    <button id="btn-clear-catalog" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/20 flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
                                        <span class="material-symbols-outlined text-xs">delete</span>
                                        <span>Limpiar</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Lista de Ítems de Catálogo -->
                        <div class="flex-1 overflow-y-auto min-h-0 bg-black/40 border border-white/5 rounded-xl p-4">
                            ${activeCatalog.length === 0 ? `
                                <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                                    <span class="material-symbols-outlined text-2xl text-white/20">format_list_bulleted</span>
                                    <p class="text-xs text-white/40 font-bold">Catálogo de Ítems Vacío</p>
                                    <p class="text-[10px] text-white/30 max-w-xs leading-normal">Carga un archivo JSON con los códigos y nombres de las actividades para asignarlas a las evidencias.</p>
                                </div>
                            ` : `
                                <div class="space-y-1.5">
                                    ${activeCatalog.map(c => `
                                        <div class="flex justify-between items-start gap-4 p-2 rounded-lg bg-white/[0.01] border border-white/5 text-xs hover:border-white/10 transition-all">
                                            <span class="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shrink-0">${c.item}</span>
                                            <span class="text-white/85 font-body text-left flex-1 leading-relaxed">${c.descripcion}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        } else {
            rightColumnHtml = `
                <div class="h-full bg-[#0a0a0c] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-border">
                        <span class="material-symbols-outlined text-3xl animate-pulse">token</span>
                    </div>
                    <div class="space-y-1.5">
                        <h3 class="text-lg font-bold font-headline text-white">Ningún Proyecto Activo</h3>
                        <p class="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">Selecciona un proyecto de la lista izquierda, crea uno nuevo o importa un archivo de extensión .logi para comenzar a trabajar.</p>
                    </div>
                    <button id="btn-open-proj-file-empty" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer">
                        <span class="material-symbols-outlined text-sm">folder_open</span>
                        <span>Importar Proyecto (.logi)</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header General -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4 shrink-0">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Consola de Control · Logi Studio</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Gestión de Proyectos</h1>
                    </div>
                </div>

                <!-- Estructura de Dos Columnas -->
                <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    <!-- COLUMNA IZQUIERDA: Listado de Workspace -->
                    <div class="col-span-4 flex flex-col h-full space-y-4 min-h-0">
                        <div class="flex flex-col space-y-2 border-b border-white/5 pb-4 shrink-0">
                            <h3 class="font-headline font-bold text-xs text-white/50 uppercase tracking-widest">Workspace de Proyectos</h3>
                            
                            <!-- Crear Proyecto Rápido -->
                            <div class="flex border border-white/10 rounded-xl overflow-hidden bg-black/60 focus-within:border-primary/50 transition-all mt-2">
                                <input id="new-proj-name" type="text" placeholder="Escribe el nombre del proyecto..." class="bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 outline-none flex-1 uppercase" />
                                <button id="btn-create-proj" class="px-4 bg-white/10 hover:bg-white/20 text-white border-l border-white/10 font-bold text-xs transition-all active:scale-95 cursor-pointer">
                                    Crear
                                </button>
                            </div>
                        </div>

                        <!-- Lista de Proyectos -->
                        <div class="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                            ${projectsListHtml}
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: Operaciones del Proyecto Activo -->
                    <div class="col-span-8 h-full min-h-0">
                        ${rightColumnHtml}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.bindEvents();

        State.subscribe((state, changeType) => {
            if (changeType === 'project' || changeType === 'projects') {
                Architect.render('projects');
            }
        });
    },

    bindEvents() {
        const btnSaveActive = document.getElementById('btn-save-active-proj');
        if (btnSaveActive) {
            btnSaveActive.onclick = () => ProjectFileManager.exportLogiProject();
        }

        const btnRenameActive = document.getElementById('btn-rename-active-proj');
        if (btnRenameActive) {
            btnRenameActive.onclick = async () => {
                const id = btnRenameActive.dataset.id;
                const oldName = btnRenameActive.dataset.name;
                const newName = prompt(`Cambiar nombre al proyecto "${oldName}":`, oldName);
                if (newName && newName.trim() && newName.trim().toUpperCase() !== oldName) {
                    await State.updateProject(id, newName.trim());
                }
            };
        }

        const btnCloseActive = document.getElementById('btn-close-active-proj');
        if (btnCloseActive) {
            btnCloseActive.onclick = async () => {
                await State.closeProject();
            };
        }

        const btnCreate = document.getElementById('btn-create-proj');
        const inputName = document.getElementById('new-proj-name');

        if (btnCreate && inputName) {
            const handleCreate = async () => {
                const val = inputName.value.trim();
                if (val) {
                    await State.createProject(val);
                    inputName.value = '';
                } else {
                    alert("Ingresa un nombre para el proyecto.");
                }
            };
            btnCreate.onclick = handleCreate;
            inputName.onkeydown = (e) => {
                if (e.key === 'Enter') handleCreate();
            };
        }

        // Cargador e Importador de Proyectos .logi
        const handleOpenProjFile = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.logi, .logiproject, .zip';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) ProjectFileManager.importLogiProject(file);
            };
            input.click();
        };

        const btnOpenFile = document.getElementById('btn-open-proj-file');
        if (btnOpenFile) btnOpenFile.onclick = handleOpenProjFile;

        const btnOpenFileEmpty = document.getElementById('btn-open-proj-file-empty');
        if (btnOpenFileEmpty) btnOpenFileEmpty.onclick = handleOpenProjFile;

        // Cargar Catálogo desde JSON
        const btnUploadCatalog = document.getElementById('btn-upload-catalog');
        if (btnUploadCatalog) {
            btnUploadCatalog.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
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
                                    alert(`¡Catálogo cargado con éxito! Se cargaron ${cleanItems.length} ítems en este proyecto.`);
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
            };
        }

        const btnClearCatalog = document.getElementById('btn-clear-catalog');
        if (btnClearCatalog) {
            btnClearCatalog.onclick = async () => {
                if (confirm("¿Estás seguro de eliminar todo el catálogo de ítems de este proyecto?")) {
                    await State.clearCatalog(State.currentProject.id);
                }
            };
        }

        // Seleccionar Proyecto Activo
        document.querySelectorAll('.btn-select-proj').forEach(btn => {
            btn.onclick = async () => {
                const proj = State.projects.find(p => p.id === btn.dataset.id);
                if (proj) {
                    await State.setCurrentProject(proj);
                }
            };
        });

        // Cambiar Nombre del Proyecto (Rename en Grilla)
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

        // Eliminar Proyecto de la lista
        document.querySelectorAll('.btn-delete-proj').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                if (confirm(`¿Estás seguro de eliminar el proyecto "${name}"? Se borrarán sus datos asociados.`)) {
                    await State.deleteProject(id);
                }
            };
        });
    }
};
