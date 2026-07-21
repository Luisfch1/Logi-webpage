/**
 * ProjectsScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Project Management Workspace: Create, Rename, Select, Save .logiproject, and Delete
 */
import { State } from '../../core/State.js';
import { Architect } from '../../core/Architect.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const ProjectsScreen = {
    getLayout() {
        const projects = State.projects || [];
        const currentProject = State.currentProject;
        const allItems = State._allItems || [];
        const activeProjItems = currentProject ? allItems.filter(i => i.projectId === currentProject.id || i._pnname === currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, '')) : [];
        const activePhotoCount = activeProjItems.length;
        const activeCatalogCount = State.catalog?.length || 0;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header General -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Consola de Control · Logi Studio</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Gestión de Proyectos</h1>
                    </div>
                    <span class="text-xs font-mono text-white/40 uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full">${projects.length} Proyectos en Workspace</span>
                </div>

                <!-- ZONA DEDICADA A PROYECTO ACTIVO -->
                <div class="bg-[#0c0c0e] border-2 border-primary/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <!-- Información del Proyecto Activo -->
                    <div class="space-y-4 z-10">
                        <div>
                            <span class="text-[9px] font-mono font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">PROYECTO EN TRABAJO</span>
                            <div class="flex items-center gap-3 mt-2">
                                <h2 class="text-3xl font-black font-headline text-white tracking-wide animate-in" id="active-project-name">${currentProject ? currentProject.name : 'NINGUNO'}</h2>
                                ${currentProject ? `
                                    <button id="btn-rename-active-proj" class="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all" data-id="${currentProject.id}" data-name="${currentProject.name}" title="Editar Nombre">
                                        <span class="material-symbols-outlined text-base">edit</span>
                                    </button>
                                ` : ''}
                            </div>
                            <p class="text-[10px] font-mono text-white/40 mt-1">ID: ${currentProject ? currentProject.id : 'N/A'}</p>
                        </div>
                        
                        <div class="flex items-center gap-6 text-xs text-white/60">
                            <div class="flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-primary text-sm">photo_library</span>
                                <span class="font-bold text-white font-mono">${activePhotoCount}</span> Evidencias
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-primary text-sm">format_list_bulleted</span>
                                <span class="font-bold text-white font-mono">${activeCatalogCount}</span> Ítems de Catálogo
                            </div>
                        </div>
                    </div>

                    <!-- Panel de Acciones Rápidas (Guardar, Abrir, Crear) -->
                    <div class="flex flex-col gap-4 w-full xl:w-auto z-10 shrink-0">
                        <!-- Guardar y Abrir -->
                        <div class="flex gap-3">
                            <button id="btn-save-active-proj" class="flex-1 xl:flex-none px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs flex items-center justify-center gap-2 glow-border active:scale-95 transition-all cursor-pointer">
                                <span class="material-symbols-outlined text-sm font-bold">save</span>
                                <span>Guardar Proyecto (.logi)</span>
                            </button>
                            <button id="btn-open-proj-file" class="flex-1 xl:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer">
                                <span class="material-symbols-outlined text-sm">folder_open</span>
                                <span>Abrir Archivo (.logi)</span>
                            </button>
                        </div>
                        
                        <!-- Crear Proyecto -->
                        <div class="flex border border-white/10 rounded-xl overflow-hidden bg-black/60 focus-within:border-primary/50 transition-all">
                            <input id="new-proj-name" type="text" placeholder="Nombre del nuevo proyecto..." class="bg-transparent px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none w-64 uppercase" />
                            <button id="btn-create-proj" class="px-4 bg-white/10 hover:bg-white/20 text-white border-l border-white/10 font-bold text-xs transition-all active:scale-95 cursor-pointer">
                                Crear
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lista de Otros Proyectos -->
                <div class="flex-1 overflow-hidden flex flex-col space-y-4">
                    <h3 class="font-headline font-bold text-sm text-white/50 uppercase tracking-widest">Workspace de Proyectos</h3>
                    <div class="grid grid-cols-3 gap-6 flex-1 overflow-y-auto pr-1">
                        ${projects.map(p => {
                            const isActive = p.id === currentProject?.id;
                            const projItems = allItems.filter(i => i.projectId === p.id || i._pnname === p.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
                            const photoCount = projItems.length;

                            return `
                                <div class="p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${isActive ? 'bg-primary/5 border-primary shadow-xl ring-1 ring-primary/20' : 'bg-[#0a0a0c] border-white/10 hover:border-white/20'}">
                                    <div class="space-y-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-[9px] font-mono font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">${isActive ? 'ACTIVO ACTUALMENTE' : 'DISPONIBLE'}</span>
                                            <div class="flex items-center gap-1">
                                                <button class="btn-rename-proj p-1 text-white/40 hover:text-white rounded hover:bg-white/5 transition-all" data-id="${p.id}" data-name="${p.name}" title="Cambiar Nombre">
                                                    <span class="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                ${projects.length > 1 ? `
                                                    <button class="btn-delete-proj p-1 text-white/40 hover:text-rose-400 rounded hover:bg-white/5 transition-all" data-id="${p.id}" data-name="${p.name}" title="Eliminar Proyecto">
                                                        <span class="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 class="text-xl font-bold font-headline text-white tracking-wide">${p.name}</h3>
                                            <p class="text-[10px] font-mono text-white/40 mt-1">ID: ${p.id}</p>
                                        </div>

                                        <div class="flex items-center gap-4 text-xs text-white/60 pt-2 border-t border-white/5">
                                            <div class="flex items-center gap-1.5">
                                                <span class="material-symbols-outlined text-primary text-sm">photo_library</span>
                                                <span class="font-bold text-white font-mono">${photoCount}</span> Evidencias
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex gap-2 pt-3 border-t border-white/5">
                                        <button class="btn-select-proj flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-primary/25 text-primary border border-primary/30 pointer-events-none' : 'bg-white/5 text-white hover:bg-white/10'}" data-id="${p.id}">
                                            ${isActive ? 'Trabajando Aquí ✓' : 'Seleccionar Proyecto'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
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

        const btnOpenFile = document.getElementById('btn-open-proj-file');
        if (btnOpenFile) {
            btnOpenFile.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.logi, .logiproject, .zip';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) ProjectFileManager.importLogiProject(file);
                };
                input.click();
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

        // Cambiar Nombre del Proyecto (Rename)
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

        // Eliminar Proyecto
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
