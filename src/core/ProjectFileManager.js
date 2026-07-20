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

        console.log(`[ProjectFileManager] Exportando archivo .logiproject de "${proj.name}"...`);

        const zip = new JSZip();
        const items = State.items;
        const catalog = State.catalog || [];

        // 1. Manifiesto del Proyecto
        const manifest = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            project: proj,
            catalogCount: catalog.length,
            itemsCount: items.length
        };

        zip.file('manifest.json', JSON.stringify(manifest, null, 2));
        zip.file('catalog.json', JSON.stringify(catalog, null, 2));

        // 2. Metadatos de Ítems sin Base64
        const cleanItems = items.map(it => {
            const copy = { ...it };
            delete copy._tempImageSrc;
            delete copy.base64;
            return copy;
        });

        zip.file('items.json', JSON.stringify(cleanItems, null, 2));

        // 3. Empaquetar Fotografías en blobs/
        const blobsFolder = zip.folder('blobs');
        let packedCount = 0;

        for (const it of items) {
            if (it.filename) {
                const b64 = await LogiNative.readBlobAsBase64(it.filename);
                if (b64) {
                    const rawBase64 = b64.replace(/^data:image\/[a-z]+;base64,/, '');
                    blobsFolder.file(it.filename, rawBase64, { base64: true });
                    packedCount++;
                }
            }
        }

        console.log(`[ProjectFileManager] Empaquetadas ${packedCount} fotos en .logiproject`);

        // 4. Generar archivo Blob .logiproject y descargar
        const content = await zip.generateAsync({ type: 'blob' });
        const cleanProjName = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const fileName = `${cleanProjName}_${new Date().toISOString().slice(0, 10)}.logiproject`;

        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        alert(`¡Proyecto guardado con éxito como "${fileName}"! (${packedCount} fotos encriptadas)`);
    },

    async importLogiProject(file) {
        if (!file) return;

        console.log(`[ProjectFileManager] Leyendo archivo .logiproject: ${file.name}...`);

        try {
            const zip = await JSZip.loadAsync(file);

            // 1. Leer Manifiesto y Metadatos
            const manifestFile = zip.file('manifest.json');
            const itemsFile = zip.file('items.json');
            const catalogFile = zip.file('catalog.json');

            if (!manifestFile || !itemsFile) {
                throw new Error("El archivo no es un proyecto .logiproject válido.");
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
            for (const it of importedItems) {
                it.projectId = importedProj.id;
                await LogiNative.dbPut('items_meta', it);
            }

            // 5. Establecer proyecto activo y recargar
            await State.loadFromDisk();
            await State.setCurrentProject(importedProj);

            alert(`¡Proyecto "${importedProj.name}" abierto exitosamente! (${extractedCount} fotos restauradas)`);
        } catch (err) {
            console.error('[ProjectFileManager] Error al abrir .logiproject:', err);
            alert("Error al abrir el proyecto: " + err.message);
        }
    }
};
