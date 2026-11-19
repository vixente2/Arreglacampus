# Informes y Métricas - Panel de Administración

## Acceso

Para acceder al apartado de Informes y Métricas, inicia sesión como administrador en:

```
/admin/reports
```

## Funcionalidad

La vista de informes muestra:

### Métricas Generales
- **Total de solicitudes**: Número total de incidencias reportadas
- **Enviadas**: Solicitudes aún no resueltas
- **Resueltas**: Solicitudes marcadas como completadas
- **Tasa de resolución**: Porcentaje de solicitudes resueltas

### Estado de Solicitudes
Muestra el conteo de solicitudes por estado:
- Enviada (submitted)
- En revisión (review)
- En proceso (progress)
- Resuelta (solved)

### Incidencias por Categoría
Visualización de incidencias por:
- Mobiliario
- Iluminación
- Limpieza
- Accesibilidad
- Otro

### Tiempo Promedio de Resolución
Muestra el promedio de días para resolver incidencias por categoría.

### Solicitudes Recientes
Lista las últimas 10 solicitudes con su estado actual.

## Descarga de Reportes

Se puede descargar un archivo CSV con todas las solicitudes haciendo clic en el botón **📥 Descargar CSV** en la sección "Estado de solicitudes".

El archivo CSV contiene:
- ID de la solicitud
- Título
- Descripción
- Categoría
- Ubicación
- Estado
- Fecha de creación

## Archivos Relevantes

| Archivo | Descripción |
|---------|-------------|
| `src/collections/Reports.ts` | Colección de reportes (oculta) |
| `src/server/components/ReportsView.server.tsx` | Componente de la vista de informes |
| `src/server/components/ExportCSV.server.ts` | Función de exportación a CSV |
| `src/app/(payload)/api/admin/reports/export/route.ts` | Endpoint API para descarga |
| `src/app/(payload)/admin/importMap.js` | Mapa de importaciones actualizado |
| `src/payload.config.ts` | Configuración con vista personalizada |

## Notas

- La vista requiere permisos de administrador
- Los datos se actualizan automáticamente al refrescar la página
- El CSV se descarga con codificación UTF-8