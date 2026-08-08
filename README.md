# The Launcher

A minimal desktop app launcher built with **Tauri**, **React**, and **TypeScript**. Add your favorite executables once, then launch them from a single, clean grid — no more hunting through folders or desktop icons.

## Why

Gamers tend to accumulate a pile of platform launchers over the years — Steam, Epic Games, EA App, Ubisoft Connect, GOG Galaxy, Battle.net, Xbox App, Riot Client, and more, on top of standalone `.exe` games. With so many of them scattered across the Start menu, desktop, and taskbar, it's easy to forget which launcher a given game actually lives in, or even forget that a launcher is installed at all.

The Launcher solves that by giving you **one single place** to register and open all of them. Add each launcher (or any executable) once, and from then on you launch everything from the same clean grid — no more hunting, no more "wait, which launcher was that game on again?".

## Features

- **Add any executable** — pick a file through the native file picker, give it a name, done. Works for game launchers (Steam, Epic, EA App, etc.) as well as any other app or `.exe`
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

Releases are cut with the `pnpm tag` script, then published by CI once the tag is pushed.

### 1. Make sure your working tree is clean

The script refuses to run if you have uncommitted changes — commit or stash first.

### 2. Bump the version and create the tag

```bash
pnpm tag patch   # bump X.Y.(Z+1)
pnpm tag minor   # bump X.(Y+1).0
pnpm tag major   # bump (X+1).0.0
pnpm tag 1.4.0   # or set an explicit version
```

This runs [scripts/tag-release.mjs](scripts/tag-release.mjs), which:

1. Reads the current version from `package.json`
2. Writes the new version to `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
3. Commits the change with message `chore: bump version to vX.Y.Z`
4. Creates a local git tag `vX.Y.Z`

Nothing is pushed yet at this point.

### 3. Push the commit and the tag

```bash
git push && git push origin vX.Y.Z
```

(replace `vX.Y.Z` with the tag printed by the script in step 2)

### 4. CI takes over

Pushing a `v*` tag triggers the [Build Windows](.github/workflows/build-windows.yml) workflow, which builds the app with `pnpm tauri build` and publishes the `.msi`/`.exe` installers as a GitHub Release with auto-generated release notes. You can follow progress under the repo's **Actions** tab.

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
