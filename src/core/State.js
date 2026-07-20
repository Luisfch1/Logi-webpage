/**
 * State.js
 * Estado reactivo del Diseñador de Esquemas (.logifmt) y Workspace
 */
export const State = {
    listeners: [],

    // Esquema activo en el Diseñador
    currentSchema: {
        meta: {
            schemaId: 'fmt_nuevo_esquema',
            schemaVersion: '1.0.0',
            title: 'Nuevo Esquema de Inspección',
            description: 'Definición de campos y evidencias de captura.',
            category: 'General',
            author: 'Logi Studio User',
            company: '',
            createdAt: new Date().toISOString()
        },
        settings: {
            requireGps: true,
            allowGalleryImport: true,
            maxPhotosPerItem: 6
        },
        fields: []
    },

    selectedFieldId: null,

    subscribe(listener) {
        this.listeners.push(listener);
    },

    notify(changeType = 'all') {
        this.listeners.forEach(fn => fn(this, changeType));
    },

    // --- Acciones de Campos ---
    addField(type) {
        const fieldId = `fld_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
        const typeLabels = {
            text: 'Texto de Observación',
            number: 'Medición / Valor',
            select: 'Estado / Categoría',
            multi_select: 'Lista de Chequeo',
            boolean: 'Verificación (Sí/No)',
            date: 'Fecha de Inspección',
            time: 'Hora de Registro',
            photo: 'Evidencia Fotográfica',
            location: 'Coordenadas GPS',
            signature: 'Firma del Responsable',
            qr_barcode: 'Escaneo Código QR/Barras'
        };

        const newField = {
            id: fieldId,
            label: typeLabels[type] || 'Nuevo Campo',
            type: type,
            required: false,
            unit: type === 'number' ? 'm' : '',
            options: type === 'select' || type === 'multi_select' ? ['Opción 1', 'Opción 2', 'Opción 3'] : [],
            minPhotos: type === 'photo' ? 1 : undefined,
            maxPhotos: type === 'photo' ? 4 : undefined
        };

        this.currentSchema.fields.push(newField);
        this.selectedFieldId = fieldId;
        this.notify('fields');
    },

    removeField(id) {
        this.currentSchema.fields = this.currentSchema.fields.filter(f => f.id !== id);
        if (this.selectedFieldId === id) {
            this.selectedFieldId = this.currentSchema.fields[0]?.id || null;
        }
        this.notify('fields');
    },

    selectField(id) {
        this.selectedFieldId = id;
        this.notify('selectField');
    },

    updateField(id, key, value) {
        const field = this.currentSchema.fields.find(f => f.id === id);
        if (field) {
            field[key] = value;
            this.notify('fieldUpdate');
        }
    },

    reorderFields(oldIndex, newIndex) {
        const fields = this.currentSchema.fields;
        const [moved] = fields.splice(oldIndex, 1);
        fields.splice(newIndex, 0, moved);
        this.notify('fields');
    },

    loadSchema(schemaJson) {
        if (schemaJson && Array.isArray(schemaJson.fields)) {
            this.currentSchema = schemaJson;
            this.selectedFieldId = schemaJson.fields[0]?.id || null;
            this.notify('schemaLoaded');
        }
    }
};
