# Resolver conflictos de Git en VS Code

Cuando `git merge` se detiene por conflictos, Git no puede decidir automáticamente qué versión conservar. No sobrescribas un archivo completo sin revisar los cambios: podrías perder trabajo de tu equipo.

## Resolver un conflicto de contenido

1. En VS Code, abre **Source Control** y selecciona el archivo en conflicto para abrir el editor de combinación. Si no aparece, abre la paleta de comandos (`Ctrl+Shift+P`) y busca **Git: Open Merge Editor**.
2. Compara los cambios actuales (**Current**) con los que vienen de la otra rama (**Incoming**) y consulta **Base** si necesitas ver el contenido previo.
3. Para cada bloque, elige **Accept Current**, **Accept Incoming** o **Accept Both** según qué cambios deban quedar. También puedes editar el resultado directamente.
4. Revisa el resultado completo y guarda el archivo.
5. Marca como resuelto solo el archivo que revisaste:

   ```powershell
   git add -- ruta\al\archivo
   ```

GitLens es una extensión opcional que puede ayudar a visualizar el historial y los cambios. El editor de combinación también está integrado en VS Code.

## Conflictos de ubicación o archivos binarios

Un mensaje como `CONFLICT (file location)` indica que las ramas movieron o agregaron un archivo en ubicaciones distintas. Confirma cuál es la ubicación que usa el proyecto y que el archivo correcto esté allí; luego agrega esa ruta exacta. Por ejemplo, si el logo debe quedar en `frontend/images`:

```powershell
git add -- frontend/images/logotransparente.png
```

Las imágenes y otros archivos binarios no se pueden combinar línea por línea. Si ambas ramas contienen versiones distintas, compara las versiones y conserva la que el equipo quiera usar antes de marcar el archivo como resuelto.

## Comprobar y finalizar la combinación

Comprueba si quedan conflictos:

```powershell
git diff --name-only --diff-filter=U
git status
```

El primer comando no debe mostrar archivos. Revisa también los cambios preparados en `git status`; evita `git add .` porque podría incluir archivos que no hayas revisado. Cuando todos los conflictos estén resueltos y los cambios estén correctos, finaliza la combinación:

```powershell
git merge --continue
```
