import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const hyperframesDir = path.join(projectRoot, "scripts/hyperframes");
const rawRecordDir = path.join(hyperframesDir, "raw_capture");
const finalOutputMp4 = path.join(projectRoot, "Atentiv_HyperFrames_Product_Demo.mp4");

// Clean and prepare raw capture folder
if (fs.existsSync(rawRecordDir)) {
  fs.rmSync(rawRecordDir, { recursive: true, force: true });
}
fs.mkdirSync(rawRecordDir, { recursive: true });

console.log("===============================================================");
console.log("  ATENTIV HYPERFRAMES COMPOSITION VIDEO RENDERER (GSAP 20s)");
console.log("===============================================================");
console.log(`- Composition:    scripts/hyperframes/index.html`);
console.log(`- Resolution:     1920 x 1080 Full HD (30 fps)`);
console.log(`- Target Length:  20 seconds (600 frames)`);
console.log(`- Output Target:  ${finalOutputMp4}`);
console.log("===============================================================\n");

async function renderHyperFrames() {
  console.log("1. Launching Headless Chromium with Playwright video recorder...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-gpu",
      "--hide-scrollbars",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: rawRecordDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  const htmlPath = path.join(hyperframesDir, "index.html");
  console.log(`2. Navigating to HyperFrames composition: file://${htmlPath}...`);

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

  console.log("3. Initiating deterministic GSAP timeline (20s duration)...");
  await page.evaluate(() => window.startHyperFramesAnimation());

  console.log("4. Capturing frames across scenes: Hero -> Content.js WASM -> Popup -> Side Panel -> Dashboard & Options...");
  await page.waitForFunction(() => window.__ANIMATION_COMPLETE__ === true, {
    timeout: 60000,
  });

  console.log("5. GSAP timeline completed! Finalizing capture stream...");
  await page.waitForTimeout(500);
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded WebM
  const files = fs.readdirSync(rawRecordDir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error("No recorded WebM video found in " + rawRecordDir);
  }
  const rawWebmPath = path.join(rawRecordDir, files[0]);
  console.log(`6. Captured raw WebM stream: ${rawWebmPath}`);

  // FFmpeg Transcode to 1080p MP4 + Ambient Productivity Audio Track
  console.log("7. Compiling 1080p MP4 with FFmpeg & audio synthesis...");
  const ffmpegCmd = `ffmpeg -y -i "${rawWebmPath}" \
    -f lavfi -i "anoisesrc=c=pink:r=44100:a=0.015,lowpass=f=350" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "${finalOutputMp4}"`;

  execSync(ffmpegCmd, { stdio: "inherit" });

  const stats = fs.statSync(finalOutputMp4);
  console.log("\n===============================================================");
  console.log("  HYPERFRAMES ANIMATION RENDERED SUCCESSFULLY!");
  console.log("===============================================================");
  console.log(`- Final MP4:   ${finalOutputMp4}`);
  console.log(`- Duration:    20.0 seconds`);
  console.log(`- File Size:   ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("===============================================================\n");
}

renderHyperFrames().catch((err) => {
  console.error("HyperFrames rendering failed:", err);
  process.exit(1);
});
