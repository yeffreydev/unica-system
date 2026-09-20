mod sidecar;

use sidecar::SidecarProcess;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarProcess(std::sync::Mutex::new(None)))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // El servidor local se levanta con la app: todo lo que haga el
            // usuario, incluso sin internet, se guarda y se calcula ahí.
            match sidecar::spawn(app.handle()) {
                Ok(child) => {
                    let state = app.state::<SidecarProcess>();
                    *state.0.lock().unwrap() = Some(child);
                }
                Err(e) => log::error!("No se pudo iniciar el servidor local: {e}"),
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            // Al cerrar, se baja el sidecar: si queda vivo, el próximo arranque
            // encuentra el puerto ocupado y la app se queda sin backend.
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.state::<SidecarProcess>();
                let child = state.0.lock().unwrap().take();
                if let Some(child) = child {
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
