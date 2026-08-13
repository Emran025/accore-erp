# Tauri desktop build references

The desktop packaging configuration follows the official Tauri 2 documentation:

- The [Tauri Next.js guide](https://v2.tauri.app/start/frontend/nextjs/) requires a static Next.js export (`output: 'export'`) and sets Tauri `frontendDist` to Next.js's `out` directory. It also recommends unoptimized images for static export and matching the Tauri development URL to the frontend development server.
- The [Tauri GitHub Actions guide](https://v2.tauri.app/distribute/pipelines/github/) documents a matrix build on Linux, Windows, and macOS, Linux WebKit/AppImage dependencies, Node and Rust setup, a Rust artifact cache, and `tauri-apps/tauri-action@v1` for package and release uploads.
- The [`tauri-apps/tauri-action` README](https://github.com/tauri-apps/tauri-action) documents `projectPath` for nested Tauri projects, `tauriScript` for project-local CLI invocation, and `uploadWorkflowArtifacts` for downloadable workflow artifacts.

The repository workflow uses these practices for `frontend/src-tauri` and builds release assets when a `desktop-v*` tag is pushed.
