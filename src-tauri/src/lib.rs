use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Enable window controls for the main window
      let window = app.get_webview_window("main").unwrap();

      // Set window properties for proper dragging and controls
      #[cfg(target_os = "macos")]
      {
        use tauri::TitleBarStyle;
        window.set_title_bar_style(TitleBarStyle::Overlay).unwrap();
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
