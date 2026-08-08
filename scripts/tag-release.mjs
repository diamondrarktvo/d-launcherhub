#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(rootDir, "package.json");
const tauriConfPath = join(rootDir, "src-tauri/tauri.conf.json");
const cargoTomlPath = join(rootDir, "src-tauri/Cargo.toml");

function run(cmd) {
  return execSync(cmd, { cwd: rootDir, stdio: "pipe" }).toString().trim();
}

function bumpVersion(current, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;

  const [major, minor, patch] = current.split(".").map(Number);
  switch (bump) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump type "${bump}". Use patch, minor, major, or an explicit X.Y.Z.`);
  }
}

const bump = process.argv[2];
if (!bump) {
  console.error("Usage: pnpm tag <patch|minor|major|X.Y.Z>");
  process.exit(1);
}

if (run("git status --porcelain")) {
  console.error("Working tree not clean. Commit or stash your changes first.");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const newVersion = bumpVersion(pkg.version, bump);
const tag = `v${newVersion}`;

if (run("git tag -l " + tag)) {
  console.error(`Tag ${tag} already exists.`);
  process.exit(1);
}

pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
tauriConf.version = newVersion;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");

const cargoToml = readFileSync(cargoTomlPath, "utf8");
const updatedCargoToml = cargoToml.replace(
  /^version = ".*"$/m,
  `version = "${newVersion}"`
);
writeFileSync(cargoTomlPath, updatedCargoToml);

run(`git add ${pkgPath} ${tauriConfPath} ${cargoTomlPath}`);
run(`git commit -m "chore: bump version to ${tag}"`);
run(`git tag ${tag}`);

console.log(`Bumped version to ${newVersion} and created tag ${tag}.`);
console.log(`Push with: git push && git push origin ${tag}`);
