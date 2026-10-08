import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(process.env.TEST_BASE_URL || "http://localhost:3000");
await page.getByRole("heading", { name: "Meet & connect" }).waitFor();
await page.getByRole("heading", { name: "Design team standup" }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: "artifacts/dashboard-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "artifacts/dashboard-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: /^Schedule Plan/ }).click();
await page.screenshot({
  path: "artifacts/schedule-mobile.png",
  fullPage: true,
});
await browser.close();
