import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertFile(relativePath, minBytes = 1) {
  const filePath = path.join(repoRoot, relativePath);
  assert(existsSync(filePath), `Missing required file: ${relativePath}`);

  const size = statSync(filePath).size;
  assert(size >= minBytes, `File is too small: ${relativePath} (${size} bytes)`);
}

function assertPng(relativePath, expectedWidth, expectedHeight, minBytes = 10_000) {
  const filePath = path.join(repoRoot, relativePath);
  assertFile(relativePath, minBytes);

  const buffer = readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  assert(signature === "89504e470d0a1a0a", `Invalid PNG signature: ${relativePath}`);

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert(width === expectedWidth, `Unexpected PNG width for ${relativePath}: ${width}`);
  assert(height === expectedHeight, `Unexpected PNG height for ${relativePath}: ${height}`);
}

assertFile("docs/final-report.html", 10_000);
assertFile("docs/final-report.pdf", 50_000);
assertFile("manifest.webmanifest", 500);
assertFile("service-worker.js", 1_000);
assertPng("docs/assets/screenshots/2026-06-02-dashboard-capture.png", 1440, 1800);
assertPng("docs/assets/screenshots/2026-06-02-dashboard-mobile.png", 390, 1200);
assertPng("assets/icons/icon-192.png", 192, 192, 500);
assertPng("assets/icons/icon-512.png", 512, 512, 1_000);

const pdfHeader = readFileSync(path.join(repoRoot, "docs/final-report.pdf"), "utf8").slice(0, 4);
assert(pdfHeader === "%PDF", "Final report PDF header is invalid.");

const reportHtml = readText("docs/final-report.html");
assert(reportHtml.includes("프로세스에 입각한 바이브코딩의 효과 분석"), "Report title is missing.");
assert(reportHtml.includes("github.com/Bias92/korea-regional-imbalance"), "Repository URL is missing from report.");
assert(reportHtml.includes("bias92.github.io/korea-regional-imbalance"), "GitHub Pages URL is missing from report.");
assert(reportHtml.includes("2026-06-02-dashboard-capture.png"), "Desktop screenshot is missing from report.");
assert(reportHtml.includes("2026-06-02-dashboard-mobile.png"), "Mobile screenshot is missing from report.");

const evidence = readText("docs/submission-evidence.md");
assert(evidence.includes("docs/final-report.pdf"), "Submission evidence does not reference final-report.pdf.");
assert(evidence.includes("2026-06-02"), "Submission evidence does not include the latest evidence date.");
assert(evidence.includes("https://bias92.github.io/korea-regional-imbalance/"), "Submission evidence does not reference the Pages demo URL.");

const readme = readText("README.md");
assert(readme.includes("npm run report:pdf"), "README does not document report PDF generation.");
assert(readme.includes("https://bias92.github.io/korea-regional-imbalance/"), "README does not document the Pages demo URL.");
assert(readme.includes("PWA"), "README does not document PWA installability.");

const appHtml = readText("src/index.html");
assert(appHtml.includes("manifest.webmanifest"), "App HTML does not link the web app manifest.");
assert(appHtml.includes("theme-color"), "App HTML does not define a theme color.");

const app = readText("src/app.js");
assert(app.includes("serviceWorker.register"), "App does not register the service worker.");

const manifest = JSON.parse(readText("manifest.webmanifest"));
assert(manifest.display === "standalone", "Manifest display mode must be standalone.");
assert(manifest.start_url === "./src/index.html", "Manifest start_url is unexpected.");
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "Manifest icons are missing.");

console.log("Submission verification passed.");
