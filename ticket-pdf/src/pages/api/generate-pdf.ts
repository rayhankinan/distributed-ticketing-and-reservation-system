// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await puppeteer.launch({
    executablePath:
      "/app/node_modules/puppeteer/.local-chromium/chrome/linux-119.0.6045.105/chrome-linux64/chrome",
    headless: "new",
  });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle0",
  });

  const pdf = await page.pdf({
    printBackground: true,
    format: "A4",
    margin: {
      top: "20px",
      bottom: "40px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=ticket.pdf");
  res.status(200).send(pdf);
}
