import { NextResponse } from 'next/server';
import {
  getMediaManifest,
  getMediaManifestSitemapEligible,
} from '@joelklemmer/content';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const siteBase = baseUrl.replace(/\/+$/, '');
const IMAGE_SITEMAP_MAX = 50000;
const LICENSE_URL = `${siteBase}/en/terms`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const manifest = getMediaManifest();
  const eligible = getMediaManifestSitemapEligible(manifest);
  const chunks: string[] = [];
  chunks.push(
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  );
  const limit = Math.min(eligible.length, IMAGE_SITEMAP_MAX);
  for (let i = 0; i < limit; i++) {
    const asset = eligible[i];
    const imageUrl = asset.file.startsWith('http')
      ? asset.file
      : `${siteBase}${asset.file}`;
    const title = asset.alt.slice(0, 100);
    const caption = asset.alt;
    chunks.push(
      '  <url>',
      `    <loc>${escapeXml(imageUrl)}</loc>`,
      '    <image:image>',
      `      <image:loc>${escapeXml(imageUrl)}</image:loc>`,
      `      <image:title>${escapeXml(title)}</image:title>`,
      `      <image:caption>${escapeXml(caption)}</image:caption>`,
      `      <image:license>${escapeXml(LICENSE_URL)}</image:license>`,
      '    </image:image>',
      '  </url>',
    );
  }
  chunks.push('</urlset>');
  const xml = chunks.join('\n');
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, immutable',
    },
  });
}
