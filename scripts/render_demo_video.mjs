import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const rawRecordDir = path.join(projectRoot, "scripts/demo_video/raw_record");
const finalOutputMp4 = path.join(projectRoot, "Atentiv_Product_Demo.mp4");

// Clean and prepare recording directory
if (fs.existsSync(rawRecordDir)) {
  fs.rmSync(rawRecordDir, { recursive: true, force: true });
}
fs.mkdirSync(rawRecordDir, { recursive: true });

console.log("===============================================================");
console.log("  ATENTIV HYPERFRAMES PRODUCT DEMO VIDEO RENDERER");
console.log("===============================================================");
console.log("- Source HTML:     scripts/demo_video/index.html");
console.log("- Recording Size:  1920 x 1080 (Full HD)");
console.log("- Output MP4:      Atentiv_Product_Demo.mp4");
console.log("===============================================================\n");

async function renderVideo() {
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
  const htmlPath = path.join(projectRoot, "scripts/demo_video/index.html");
  console.log(`2. Loading scene director: file://${htmlPath}...`);

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

  console.log("3. Initiating animated timeline sequence...");
  await page.evaluate(() => window.startTimeline());

  // Wait for timeline completion flag
  console.log("4. Rendering frames in real-time...");
  await page.waitForFunction(() => window.__VIDEO_DONE__ === true, {
    timeout: 120000,
  });

  console.log("5. Timeline complete! Finalizing video stream...");
  await page.waitForTimeout(1000);
  await page.close();
  await context.close();
  await browser.close();

  // Find the captured WebM file
  const files = fs.readdirSync(rawRecordDir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error("No recorded WebM video found in " + rawRecordDir);
  }
  const rawWebmPath = path.join(rawRecordDir, files[0]);
  console.log(`6. Captured raw WebM stream: ${rawWebmPath}`);

  // FFmpeg Post-Processing: Video Transcode + Ambient Focus Soundtrack Generation
  console.log("7. Compiling final 1080p MP4 with FFmpeg and audio synthesis...");

  const ffmpegCmd = `ffmpeg -y -i "${rawWebmPath}" \\
    -f lavfi -i "anoisesrc=c=pink:r=44100:a=0.015,lowpass=f=350" \\
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \\
    -c:a aac -b:a 192k -shortest \\
    "${finalOutputMp4}"`;

  execSync(ffmpegCmd, { stdio: "inherit" });

  const stats = fs.statSync(finalOutputMp4);
  console.log("\n===============================================================");
  console.log("  VIDEO RENDERING COMPLETED SUCCESSFULLY!");
  console.log("===============================================================");
  console.log(`- Final File:  ${finalOutputMp4}`);
  console.log(`- File Size:   ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("===============================================================\n");
}

renderVideo().catch((err) => {
  console.error("Video rendering failed:", err);
  process.exit(1);
});
