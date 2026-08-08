# The Launcher

A minimal desktop app launcher built with **Tauri**, **React**, and **TypeScript**. Add your favorite executables once, then launch them from a single, clean grid — no more hunting through folders or desktop icons.

## Features

- **Add any executable** — pick a file through the native file picker, give it a name, done
- **One-click launch** — start any registered app straight from the grid
- **Remove entries** you no longer need
- **Local persistence** — your launcher list is saved to disk automatically, no account or cloud required

## Tech Stack

| Layer    | Technology                                                     |
| -------- | ---------------------------------------------------------------- |
| Shell    | [Tauri 2](https://tauri.app)                                     |
| Frontend | React 19, TypeScript, Vite 7                                      |
| Styling  | Tailwind CSS 4, Radix UI, [lucide-react](https://lucide.dev)      |
| Backend  | Rust, `serde`, `tokio`                                            |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v20+) and [pnpm](https://pnpm.io)
- [Rust](https://www.rust-lang.org/tools/install) toolchain
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Installation

```bash
pnpm install
```

### Development

Run the app in development mode with hot reload:

```bash
pnpm tauri dev
```

### Build

Create a production bundle for your platform:

```bash
pnpm tauri build
```

The installer/executable will be generated under `src-tauri/target/release/bundle/`.

## Releasing a New Version

Version bumps and tags are handled by a helper script:

```bash
pnpm tag patch   # or: minor, major, or an explicit X.Y.Z
git push && git push origin <the-new-tag>
```

This updates the version in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`, commits the change, and creates a git tag. Pushing the tag triggers the [Build Windows](.github/workflows/build-windows.yml) workflow, which builds the app and publishes the installer as a GitHub Release.

## Project Structure

```
src/                  # React frontend
  api/                # Tauri command bindings
  components/         # UI components
  types/              # Shared TypeScript types
src-tauri/            # Rust backend
  src/
    commands.rs       # Tauri commands (add/list/remove/launch)
    models.rs         # Data models
    storage.rs        # JSON persistence
```

## License

No license file is currently present in this repository.
