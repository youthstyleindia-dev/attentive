import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir, platform, homedir } from "node:os";

const extPath = resolve("dist");

if (!existsSync(resolve(extPath, "manifest.json"))) {
  console.error("Error: dist/manifest.json not found. Run 'npm run build' first.");
  process.exit(1);
}

function findBrowserBinary() {
  const os = platform();
  const candidates = [];

  if (os === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      `${homedir()}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      `${homedir()}/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`,
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    );
  } else if (os === "win32") {
    const prog = process.env["PROGRAMFILES"] || "C:\\Program Files";
    const prog86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
    const local = process.env["LOCALAPPDATA"] || `${homedir()}\\AppData\\Local`;
    candidates.push(
      `${prog}\\Google\\Chrome\\Application\\chrome.exe`,
      `${prog86}\\Google\\Chrome\\Application\\chrome.exe`,
      `${local}\\Google\\Chrome\\Application\\chrome.exe`,
      `${prog}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
      `${local}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
      `${prog86}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${prog}\\Microsoft\\Edge\\Application\\msedge.exe`
    );
  } else {
    // Linux
    candidates.push(
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/brave-browser",
      "/snap/bin/chromium"
    );
  }

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

const browser = findBrowserBinary();

if (!browser) {
  console.log("No installed Chrome/Brave/Edge found at standard paths.");
  console.log("Falling back to Playwright launcher...");
  import("./open_extension.mjs").catch((err) => {
    console.error("Could not launch Playwright:", err.message);
    console.log("\nTo load manually in Chrome:");
    console.log("1. Open chrome://extensions");
    console.log("2. Enable Developer mode");
    console.log("3. Click 'Load unpacked' and select the 'dist' folder.");
  });
} else {
  const profileDir = mkdtempSync(resolve(tmpdir(), "atentiv-profile-"));
  const url = "https://github.com/facebook/react";

  console.log(`\n======================================================`);
  console.log(`Launching ${browser.split("/").pop()} with Atentiv Transparent HUD...`);
  console.log(`- Extension Path: ${extPath}`);
  console.log(`- Profile Path:   ${profileDir}`);
  console.log(`- Sample Page:    ${url}`);
  console.log(`======================================================`);
  console.log(`\nHOW TO USE:`);
  console.log(`1. Look for the floating Atentiv focus pill in the bottom-right corner.`);
  console.log(`2. Click it or press [Alt + A] to expand the Transparent Glass HUD.`);
  console.log(`3. Click 'Full View' inside the HUD to see the 3-column expanded dashboard.`);
  console.log(`======================================================\n`);

  const showcaseUrl = `file://${resolve("dist/showcase.html")}`;

  const child = spawn(
    browser,
    [
      `--user-data-dir=${profileDir}`,
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      `--no-first-run`,
      `--no-default-browser-check`,
      url,
      showcaseUrl,
    ],
    { stdio: "inherit", detached: false }
  );

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}
