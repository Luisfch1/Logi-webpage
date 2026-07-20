/**
 * ProjectsScreen.js — Logi Workspace (Desktop Suite)
 * Widescreen Project Management Workspace with .logiproject file support
 */
import { State } from '../../core/State.js';
import { Architect } from '../../core/Architect.js';
import { ProjectFileManager } from '../../core/ProjectFileManager.js';

export const ProjectsScreen = {
    getLayout() {
        const projects = State.projects || [];
        const currentId = State.currentProject?.id;

        return `
            <div class="flex flex-col h-full w-full overflow-hidden p-8 space-y-6">
                <!-- Header Proyectos -->
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                        <span class="text-[10px] font-bold font-headline uppercase tracking-widest text-primary">Gestión de Proyectos · PC Desktop</span>
                        <h1 class="text-2xl font-bold font-headline text-white">Proyectos en Workspace (${projects.length})</h1>
                    </div>

                    <div class="flex gap-3">
                        <button id="btn-open-proj-file" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all">
                            <span class="material-symbols-outlined text-sm">folder_open</span>
                            <span>Abrir Archivo (.logiproject)</span>
                        </button>
                        <input id="new-proj-name" type="text" placeholder="Nombre del nuevo proyecto..." class="bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-primary outline-none w-64" />
                        <button id="btn-create-proj" class="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs glow-border active:scale-95 transition-all">
                            + Crear Proyecto
                        </button>
                    </div>
                </div>

                <!-- Lista Panorámica de Proyectos -->
                <div class="grid grid-cols-3 gap-6 flex-1 overflow-y-auto">
                    ${projects.map(p => {
                        const isActive = p.id === currentId;
                        return `
                            <div class="p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${isActive ? 'bg-primary/10 border-primary shadow-xl' : 'bg-[#0a0a0c] border-white/10 hover:border-white/30'}">
                                <div>
                                    <span class="text-[9px] font-mono font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">${isActive ? 'ACTIVO' : 'DISPONIBLE'}</span>
                                    <h3 class="text-lg font-bold font-headline text-white mt-2">${p.name}</h3>
                                    <p class="text-[10px] font-mono text-white/40 mt-1">ID: ${p.id}</p>
                                </div>

                                <div class="flex gap-2 pt-3 border-t border-white/5">
                                    <button class="btn-select-proj flex-1 py-2 rounded-xl text-xs font-bold ${isActive ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'}" data-id="${p.id}">
                                        ${isActive ? 'Proyecto Activo' : 'Seleccionar'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
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
        const btnCreate = document.getElementById('btn-create-proj');
        const inputName = document.getElementById('new-proj-name');

        if (btnCreate && inputName) {
            btnCreate.onclick = async () => {
                const val = inputName.value.trim();
                if (val) {
                    await State.createProject(val);
                    inputName.value = '';
                } else {
                    alert("Ingresa un nombre para el proyecto.");
                }
            };
        }

        const btnOpenFile = document.getElementById('btn-open-proj-file');
        if (btnOpenFile) {
            btnOpenFile.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.logiproject, .zip';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) ProjectFileManager.importLogiProject(file);
                };
                input.click();
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
    }
};
