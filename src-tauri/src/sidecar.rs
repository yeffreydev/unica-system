//! Arranque del servidor local que la app usa cuando no hay internet.
//!
//! El instalador trae adentro el mismo backend NestJS que corre en la nube,
//! pero apuntando a una base SQLite del usuario. Este módulo lo levanta al
//! abrir la app, le pasa dónde guardar la base, y lo deja escuchando en
//! 127.0.0.1 para que el frontend le hable como le hablaría a la nube.

use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// Puerto del sidecar. El frontend usa el mismo valor por defecto.
pub const SIDECAR_PORT: u16 = 4100;

/// Handle del proceso, para poder matarlo al cerrar la ventana.
pub struct SidecarProcess(pub std::sync::Mutex<Option<CommandChild>>);

/// Ruta de la base local, dentro de los datos de la app del usuario.
fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo resolver la carpeta de datos: {e}"))?;
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("No se pudo crear la carpeta de datos: {e}"))?;
    Ok(dir.join("unica.db"))
}

/// Copia la base vacía que viene en el instalador la primera vez que se abre.
fn ensure_database(app: &AppHandle, db: &PathBuf) -> Result<(), String> {
    if db.exists() {
        return Ok(());
    }
    let seed = app
        .path()
        .resolve("payload/prisma/unica.empty.db", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("No se encontró la base inicial: {e}"))?;
    std::fs::copy(&seed, db)
        .map_err(|e| format!("No se pudo preparar la base local: {e}"))?;
    Ok(())
}

/// Levanta el sidecar y devuelve su proceso.
pub fn spawn(app: &AppHandle) -> Result<CommandChild, String> {
    let db = database_path(app)?;
    ensure_database(app, &db)?;

    let entry = app
        .path()
        .resolve(
            "payload/dist/src/main.js",
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| format!("No se encontró el servidor local: {e}"))?;

    let prisma_client = app
        .path()
        .resolve(
            "payload/prisma/generated/sqlite",
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| format!("No se encontró el cliente de la base: {e}"))?;

    let (mut rx, child) = app
        .shell()
        .sidecar("unica-sidecar")
        .map_err(|e| format!("No se pudo preparar el servidor local: {e}"))?
        .args([entry.to_string_lossy().to_string()])
        .env("APP_MODE", "local")
        .env("PORT", SIDECAR_PORT.to_string())
        .env("LOCAL_DATABASE_URL", format!("file:{}", db.to_string_lossy()))
        .env(
            "LOCAL_PRISMA_CLIENT_PATH",
            prisma_client.to_string_lossy().to_string(),
        )
        .spawn()
        .map_err(|e| format!("No se pudo iniciar el servidor local: {e}"))?;

    // Los logs del sidecar van al log de la app: sin esto, un fallo del
    // servidor local se ve como una pantalla en blanco y nada más.
    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    log::info!("[sidecar] {}", String::from_utf8_lossy(&line))
                }
                CommandEvent::Stderr(line) => {
                    log::warn!("[sidecar] {}", String::from_utf8_lossy(&line))
                }
                CommandEvent::Terminated(status) => {
                    log::warn!("[sidecar] terminó con {:?}", status.code)
                }
                _ => {}
            }
        }
    });

    Ok(child)
}
