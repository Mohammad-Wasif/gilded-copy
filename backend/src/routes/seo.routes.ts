import { Router } from "express";
import { db } from "../config/db";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export const seoRouter = Router();

seoRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = env.CORS_ORIGIN || "https://gildedheirloom.com";

    const [categories, products] = await Promise.all([
      db.category.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true }
      }),
      db.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } }
      })
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Base routes
    const staticRoutes = ["", "/shop", "/about", "/contact", "/wholesale/apply", "/faq"];
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Categories
    for (const category of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/shop/${category.slug}</loc>\n`;
      xml += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Products
    for (const product of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${product.slug}</loc>\n`;
      xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    logger.error({ error }, "Failed to generate sitemap");
    res.status(500).end();
  }
});
