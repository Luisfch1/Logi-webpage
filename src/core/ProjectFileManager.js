/**
 * ProjectFileManager.js — Logi Workspace (Desktop Suite)
 * Handles saving and opening .logiproject ZIP workspace files
 */
import JSZip from 'jszip';
import { State } from './State.js';
import { LogiNative } from './LogiNative.js';

export const ProjectFileManager = {
    async exportLogiProject() {
        const proj = State.currentProject;
        if (!proj) {
            alert("No hay un proyecto activo para guardar.");
            return;
        }

        let handle = State.currentProjectFileHandle;
        
        // 1. Si no hay handle y el navegador soporta el picker, pedirlo INMEDIATAMENTE
        // para no perder el gesto del usuario en navegadores basados en Chromium.
        if (!handle && window.showSaveFilePicker) {
            try {
                const cleanProjName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const suggestedFileName = `${cleanProjName}_${new Date().toISOString().slice(0, 10)}.logi`;
                
                handle = await window.showSaveFilePicker({
                    suggestedName: suggestedFileName,
                    types: [{
                        description: 'Proyecto Logi Workspace (.logi)',
                        accept: {
                            'application/octet-stream': ['.logi']
                        }
                    }]
                });
                State.currentProjectFileHandle = handle;
            } catch (err) {
                console.warn('[ProjectFileManager] File picker cancelled or failed:', err);
                if (err.name === 'AbortError') {
                    return; // El usuario canceló la acción conscientemente
                }
            }
        }

        window.showLoader("Guardando Proyecto", "Comprimiendo evidencias y sobrescribiendo archivo .logi...");
        try {
            console.log(`[ProjectFileManager] Exportando archivo .logiproject de "${proj.name}"...`);

            const zip = new JSZip();
            const items = State.items;
            const catalog = State.catalog || [];

            // 2. Manifiesto del Proyecto
            const manifest = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                project: proj,
                catalogCount: catalog.length,
                itemsCount: items.length
            };

            zip.file('manifest.json', JSON.stringify(manifest, null, 2));
            zip.file('catalog.json', JSON.stringify(catalog, null, 2));

            // 3. Metadatos de Ítems sin Base64
            const cleanItems = items.map(it => {
                const copy = { ...it };
                delete copy._tempImageSrc;
                delete copy.base64;
                return copy;
            });

            zip.file('items.json', JSON.stringify(cleanItems, null, 2));

            // 4. Empaquetar Fotografías en blobs/ en lotes de concurrencia 10
            const blobsFolder = zip.folder('blobs');
            let packedCount = 0;

            const concurrency = 10;
            const itemChunks = [];
            for (let i = 0; i < items.length; i += concurrency) {
                itemChunks.push(items.slice(i, i + concurrency));
            }

            for (const chunk of itemChunks) {
                await Promise.all(chunk.map(async (it) => {
                    if (it.filename) {
                        const b64 = await LogiNative.readBlobAsBase64(it.filename);
                        if (b64) {
                            const rawBase64 = b64.replace(/^data:image\/[a-z]+;base64,/, '');
                            blobsFolder.file(it.filename, rawBase64, { base64: true });
                            packedCount++;
                        }
                    }
                }));
            }

            console.log(`[ProjectFileManager] Empaquetadas ${packedCount} fotos en .logi`);

            // 5. Generar archivo Blob .logi y guardar (o sobrescribir)
            const content = await zip.generateAsync({ type: 'blob' });

            let savedDirectly = false;
            if (handle) {
                try {
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    savedDirectly = true;
                    alert("¡Proyecto guardado y sobrescrito con éxito en el archivo original!");
                } catch (err) {
                    console.error('[ProjectFileManager] Error al escribir directamente en disco:', err);
                }
            }

            if (!savedDirectly) {
                // Fallback a descarga tradicional del navegador (si no hay handle y no se soporta showSaveFilePicker)
                const cleanProjName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const fileName = `${cleanProjName}_${new Date().toISOString().slice(0, 10)}.logi`;
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
                alert(`¡Proyecto exportado con éxito como "${fileName}"! (${packedCount} fotos encriptadas)`);
            }
        } finally {
            window.hideLoader();
        }
    },

    async importLogiProject(file) {
        if (!file) return;

        console.log(`[ProjectFileManager] Leyendo archivo de proyecto: ${file.name}...`);

        try {
            const zip = await JSZip.loadAsync(file);

            // 1. Leer Manifiesto y Metadatos
            const manifestFile = zip.file('manifest.json');
            const itemsFile = zip.file('items.json');
            const catalogFile = zip.file('catalog.json');

            if (!manifestFile || !itemsFile) {
                throw new Error("El archivo no es un proyecto .logi válido.");
            }

            const manifest = JSON.parse(await manifestFile.async('text'));
            const importedItems = JSON.parse(await itemsFile.async('text'));
            const importedCatalog = catalogFile ? JSON.parse(await catalogFile.async('text')) : [];

            const importedProj = manifest.project;
            if (!importedProj || !importedProj.id) {
                throw new Error("El proyecto importado no contiene identificador válido.");
            }

            // 2. Guardar Proyecto en Meta Local
            await LogiNative.dbPut('meta', importedProj);
            if (importedCatalog.length > 0) {
                await LogiNative.dbPutCatalog(importedProj.id, importedCatalog);
            }

            // 3. Extraer e Indexar Fotografías en IndexedDB
            let extractedCount = 0;
            const blobsFolder = zip.folder('blobs');

            if (blobsFolder) {
                const entries = [];
                blobsFolder.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.isDirectory) {
                        entries.push({ name: relativePath, entry: zipEntry });
                    }
                });

                for (const item of entries) {
                    const b64Data = await item.entry.async('base64');
                    const filename = item.name.replace(/^blobs\//, '');
                    await LogiNative.storeBlob(filename, b64Data);
                    extractedCount++;
                }
            }

            // 4. Importar Ítems y Actualizar Estado
            const itemsToPut = importedItems.map(it => {
                it.projectId = importedProj.id;
                return it;
            });
            await LogiNative.dbPutBatch('items_meta', itemsToPut);

            // 5. Establecer proyecto activo y recargar
            await State.loadFromDisk();
            await State.setCurrentProject(importedProj, true);

            alert(`¡Proyecto "${importedProj.name}" abierto exitosamente! (${extractedCount} fotos restauradas)`);
        } catch (err) {
            console.error('[ProjectFileManager] Error al abrir .logiproject:', err);
            alert("Error al abrir el proyecto: " + err.message);
        }
    },

    async importControlJson(file) {
        if (!file) return;

        try {
            // 1. Leer el archivo JSON
            const reader = new FileReader();
            const rawJson = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });

            const data = JSON.parse(rawJson);

            // 2. Validaciones básicas del formato de CONTROL
            if (!data.entries || !data.photos) {
                throw new Error("El archivo no tiene un formato válido de CONTROL (debe contener 'entries' y 'photos').");
            }

            // 3. Obtener o crear el proyecto de destino
            let targetProj = State.currentProject;
            if (data.projectId && data.projectName) {
                // Si viene metadata de proyecto en el JSON, la usamos para buscar o crear
                const projects = State.projects || [];
                const existing = projects.find(p => p.id === data.projectId);
                if (existing) {
                    targetProj = existing;
                } else {
                    targetProj = {
                        id: data.projectId,
                        name: data.projectName,
                        createdAt: Date.now()
                    };
                    await LogiNative.dbPut('meta', targetProj);
                    console.log(`[ProjectFileManager] Creado nuevo proyecto desde JSON: "${targetProj.name}" (${targetProj.id})`);
                }
                // Establecer como proyecto activo
                await State.setCurrentProject(targetProj, true);
            }

            if (!targetProj) {
                throw new Error("No hay un proyecto activo seleccionado y el archivo JSON no contiene metadatos de proyecto para crearlo automáticamente.");
            }

            const { entries, photos } = data;
            console.log(`[ProjectFileManager] Detectadas ${entries.length} entradas y ${photos.length} fotos.`);

            // 4. Crear mapa de fotos (id -> base64Data)
            const photoMap = {};
            photos.forEach(p => {
                if (p.id && p.base64Data) {
                    photoMap[String(p.id)] = p.base64Data;
                }
            });

            // 5. Procesar entradas e imágenes
            let importedCount = 0;
            const itemsData = [];
            for (const entry of entries) {
                const id = String(entry.id);
                const base64Data = photoMap[id];
                if (!base64Data) {
                    console.warn(`[ProjectFileManager] Foto con ID ${id} no tiene base64Data, omitiendo.`);
                    continue;
                }

                const filename = `${id}.jpg`;

                // Guardar la foto en IndexedDB
                await LogiNative.storeBlob(filename, base64Data);

                // Parsear fecha
                let ts = Date.now();
                if (entry.date) {
                    const d = new Date(entry.date + 'T12:00:00');
                    if (!isNaN(d.getTime())) ts = d.getTime();
                }

                // Crear metadata del ítem heredando el proyecto de destino
                const itemData = {
                    id,
                    descripcion: String(entry.description || ''),
                    actividad: String(entry.itemCode || 'GENERAL').toUpperCase(),
                    createdAt: ts,
                    projectId: targetProj.id,
                    projectName: targetProj.name,
                    filename
                };
                itemsData.push(itemData);
                importedCount++;
            }

            if (itemsData.length > 0) {
                await LogiNative.dbPutBatch('items_meta', itemsData);
            }

            // 6. Recargar estado
            await State.loadFromDisk();
            if (targetProj) {
                await State.setCurrentProject(targetProj, true);
            }

            alert(`¡Importación completada con éxito! Se cargaron ${importedCount} fotos al proyecto "${targetProj.name.toUpperCase()}".`);
        } catch (err) {
            console.error('[ProjectFileManager] Error al importar JSON de CONTROL:', err);
            alert("Error al importar JSON: " + err.message);
        }
    }
};
