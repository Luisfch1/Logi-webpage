/**
 * State.js — Logi Workspace (Desktop Suite v1.0)
 * Unified Reactive State for Projects, Items, Catalogs & Schema Designer (.logifmt)
 */
import { LogiNative } from './LogiNative.js';

class StateManager {
    constructor() {
        this.currentProject = null;
        this.currentProjectFileHandle = null;
        this.projects = [];
        this._allItems = [];
        this.items = [];
        this.catalog = [];
        this.currentTab = 'projects';
        this.accentColor = localStorage.getItem('accent_color') || '#cafd00';
        this.galleryCols = parseInt(localStorage.getItem('gallery_cols_desktop')) || 4;
        this.theme = localStorage.getItem('app_theme') || 'dark';
        this.listeners = [];
        this.isLoaded = false;

        // Esquema activo en el Diseñador
        this.currentSchema = {
            meta: {
                schemaId: 'fmt_inspeccion_estandar',
                schemaVersion: '1.0.0',
                title: 'Esquema de Inspección Estándar',
                description: 'Plantilla de evidencia técnica con observaciones y mediciones.',
                category: 'General',
                author: 'Logi Studio',
                createdAt: new Date().toISOString()
            },
            settings: {
                requireGps: true,
                allowGalleryImport: true,
                maxPhotosPerItem: 6
            },
            fields: [
                { id: 'fld_obs', label: 'Observación Técnica', type: 'text', required: true },
                { id: 'fld_val', label: 'Medición / Valor', type: 'number', unit: 'm', required: false },
                { id: 'fld_foto', label: 'Fotografías de Evidencia', type: 'photo', minPhotos: 1, maxPhotos: 4, required: true }
            ]
        };
        this.selectedFieldId = 'fld_obs';

        if (typeof document !== 'undefined') {
            this.applyAccentColor();
            this.applyTheme();
        }
    }

    subscribe(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify(changeType = 'general') {
        this.listeners.forEach(listener => {
            try {
                listener(this, changeType);
            } catch (e) {
                console.error(`[State] Notification Error (${changeType}):`, e);
            }
        });
    }

    _sanitize(item) {
        if (!item) return null;
        const clean = (val) => {
            if (typeof val !== 'string') return val;
            if (val.length < 3) return val;
            if (!val.includes('<') && !val.includes('class=') && !val.includes('style=')) return val.trim();
            return val.replace(/<[^>]*>?/gm, '').trim();
        };

        item.id = clean(item.id);
        if (item.name) item.name = clean(item.name);
        if (item.descripcion) item.descripcion = clean(item.descripcion);
        if (item.actividad) item.actividad = clean(item.actividad);
        if (item.filename) item.filename = clean(item.filename);
        if (item.projectId) item.projectId = clean(item.projectId);

        let ts = item.createdAt;
        if (typeof ts === 'string') {
            const num = Number(ts);
            if (!isNaN(num)) ts = num;
        }
        if ((!ts || isNaN(Number(ts))) && item.fecha) ts = item.fecha;
        const validDate = (ts && !isNaN(new Date(ts).getTime())) ? new Date(ts) : new Date();

        item.createdAt = validDate.getTime();
        item.fechaStr = validDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        item.timeStr = validDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

        item._pndate = item.fechaStr;
        item._pnid = this._norm(item.projectId || 'p_default');
        item._pnname = this._norm(item.projectName || '');

        return item;
    }

    _norm(str) {
        if (!str) return '';
        return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    }

    async loadFromDisk() {
        console.log('[State] Cargando estado en Logi Workspace...');
        try {
            const rawProjects = await LogiNative.dbGetAll('meta');
            this.projects = (rawProjects || []).map(p => this._sanitize(p)).filter(Boolean);

            if (this.projects.length === 0) {
                const defProj = { id: 'p_casa_talud', name: 'CASA TALUD', createdAt: Date.now() };
                await LogiNative.dbPut('meta', defProj);
                this.projects = [defProj];
            }

            const activeProjId = localStorage.getItem('last_active_project_id');
            const found = this.projects.find(p => p.id === activeProjId);
            this.currentProject = found || this.projects[0];

            const rawItems = await LogiNative.dbGetAll('items_meta');
            this._allItems = (rawItems || []).map(i => this._sanitize(i)).filter(Boolean);

            this.catalog = await LogiNative.dbGetCatalog(this.currentProject.id);

            this.filterItems();
            this.isLoaded = true;
            this.notify('init');
        } catch (e) {
            console.error('[State] Error cargando disco:', e);
        }
    }

    filterItems() {
        if (!this.currentProject) {
            this.items = [];
            return;
        }
        const targetId = this._norm(this.currentProject.id);
        const targetName = this._norm(this.currentProject.name);

        this.items = this._allItems.filter(it => {
            if (it._pnid === targetId) return true;
            if (targetName && it._pnname && it._pnname === targetName) return true;
            return false;
        });

        this.items.sort((a, b) => b.createdAt - a.createdAt);
    }

    async setCurrentProject(proj, keepHandle = false) {
        if (!proj) return;
        this.currentProject = proj;
        if (!keepHandle) {
            this.currentProjectFileHandle = null;
        }
        localStorage.setItem('last_active_project_id', proj.id);
        this.catalog = await LogiNative.dbGetCatalog(proj.id);
        this.filterItems();
        this.notify('project');
    }

    async closeProject() {
        this.currentProject = null;
        this.currentProjectFileHandle = null;
        localStorage.removeItem('last_active_project_id');
        this.catalog = [];
        this.items = [];
        this.notify('project');
    }

    async updateCatalog(projectId, catalogItems) {
        await LogiNative.dbPutCatalog(projectId, catalogItems);
        if (this.currentProject && this.currentProject.id === projectId) {
            this.catalog = catalogItems;
        }
        this.notify('project');
    }

    async clearCatalog(projectId) {
        await LogiNative.dbDeleteCatalog(projectId);
        if (this.currentProject && this.currentProject.id === projectId) {
            this.catalog = [];
        }
        this.notify('project');
    }

    async createProject(name) {
        const id = 'p_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
        const proj = { id, name: name.toUpperCase(), createdAt: Date.now() };
        await LogiNative.dbPut('meta', proj);
        this.projects.unshift(proj);
        await this.setCurrentProject(proj);
        return proj;
    }

    async updateProject(id, newName) {
        const proj = this.projects.find(p => p.id === id);
        if (!proj) return;
        proj.name = newName.toUpperCase();
        await LogiNative.dbPut('meta', proj);
        if (this.currentProject && this.currentProject.id === id) {
            this.currentProject.name = proj.name;
        }
        this.notify('projects');
    }

    async deleteProject(id) {
        await LogiNative.dbDelete('meta', id);
        this.projects = this.projects.filter(p => p.id !== id);
        if (this.currentProject && this.currentProject.id === id) {
            this.currentProject = this.projects[0] || null;
            if (this.currentProject) localStorage.setItem('last_active_project_id', this.currentProject.id);
        }
        this.filterItems();
        this.notify('projects');
    }

    async addItem(data) {
        const cleanData = this._sanitize(data);
        if (!cleanData) return;

        await LogiNative.dbPut('items_meta', cleanData);
        this._allItems.unshift(cleanData);
        this.filterItems();
        this.notify('items');
    }

    async updateItem(id, updates) {
        const item = this._allItems.find(i => i.id === id);
        if (!item) return;

        Object.assign(item, updates);
        const clean = this._sanitize(item);
        await LogiNative.dbPut('items_meta', clean);
        this.filterItems();
        this.notify('items');
    }

    async deleteItem(id, filename) {
        await LogiNative.dbDelete('items_meta', id);
        if (filename) await LogiNative.deleteBlob(filename);
        this._allItems = this._allItems.filter(i => i.id !== id);
        this.filterItems();
        this.notify('items');
    }

    setTab(tab) {
        this.currentTab = tab;
        this.notify('tab');
    }

    setAccentColor(color) {
        this.accentColor = color;
        localStorage.setItem('accent_color', color);
        this.applyAccentColor();
        this.notify('accent');
    }

    applyAccentColor() {
        if (typeof document === 'undefined') return;
        document.documentElement.style.setProperty('--primary', this.accentColor);
        document.documentElement.style.setProperty('--primary-glow', `${this.accentColor}66`);
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('app_theme', theme);
        this.applyTheme();
        this.notify('theme');
    }

    applyTheme() {
        if (typeof document === 'undefined') return;
        if (this.theme === 'light') {
            document.body.classList.add('light-mode');
            document.documentElement.classList.remove('dark');
        } else {
            document.body.classList.remove('light-mode');
            document.documentElement.classList.add('dark');
        }
    }

    setGalleryCols(cols) {
        this.galleryCols = cols;
        localStorage.setItem('gallery_cols_desktop', cols);
        this.notify('cols');
    }

    // --- Diseñador de Esquemas (.logifmt) ---
    addField(type) {
        const fieldId = `fld_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
        const typeLabels = {
            text: 'Texto Libre / Observación',
            number: 'Número / Medición',
            select: 'Lista Desplegable',
            multi_select: 'Lista de Chequeo',
            boolean: 'Verificación (Sí/No)',
            date: 'Fecha',
            time: 'Hora',
            photo: 'Evidencia Fotográfica',
            location: 'Ubicación GPS',
            signature: 'Firma Digital',
            qr_barcode: 'Código QR/Barras'
        };

        const newField = {
            id: fieldId,
            label: typeLabels[type] || 'Nuevo Campo',
            type,
            required: false,
            unit: type === 'number' ? 'm' : '',
            options: (type === 'select' || type === 'multi_select') ? ['Opción 1', 'Opción 2'] : [],
            minPhotos: type === 'photo' ? 1 : undefined,
            maxPhotos: type === 'photo' ? 4 : undefined
        };

        this.currentSchema.fields.push(newField);
        this.selectedFieldId = fieldId;
        this.notify('fields');
    }

    removeField(id) {
        this.currentSchema.fields = this.currentSchema.fields.filter(f => f.id !== id);
        if (this.selectedFieldId === id) {
            this.selectedFieldId = this.currentSchema.fields[0]?.id || null;
        }
        this.notify('fields');
    }

    selectField(id) {
        this.selectedFieldId = id;
        this.notify('selectField');
    }

    updateField(id, key, value) {
        const field = this.currentSchema.fields.find(f => f.id === id);
        if (field) {
            field[key] = value;
            this.notify('fieldUpdate');
        }
    }

    loadSchema(schemaJson) {
        if (schemaJson && Array.isArray(schemaJson.fields)) {
            this.currentSchema = schemaJson;
            this.selectedFieldId = schemaJson.fields[0]?.id || null;
            this.notify('schemaLoaded');
        }
    }
}

export const State = new StateManager();
