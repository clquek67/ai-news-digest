import { DigestItem } from "./generate-digest";

export function buildEmailHtml(items: DigestItem[], dateStr: string): string {
  const cards = items
    .map(
      (item, i) => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #e5e5e5;">
        <div style="font-size: 12px; letter-spacing: 0.05em; color: #888; text-transform: uppercase; margin-bottom: 6px;">
          #${i + 1} &middot; ${escapeHtml(item.source_name)}
        </div>
        <h2 style="margin: 0 0 10px; font-size: 19px; line-height: 1.3; color: #111;">
          ${escapeHtml(item.headline)}
        </h2>
        <p style="margin: 0 0 10px; font-size: 14px; color: #333; line-height: 1.6;">
          <strong>Summary:</strong> ${escapeHtml(item.summary)}
        </p>
        <p style="margin: 0 0 10px; font-size: 14px; color: #333; line-height: 1.6;">
          <strong>Impact:</strong> ${escapeHtml(item.impact)}
        </p>
        <p style="margin: 0 0 10px; font-size: 14px; color: #555; line-height: 1.6; background: #f7f7f5; padding: 10px 12px; border-radius: 6px;">
          <strong>Draft take (edit me):</strong> ${escapeHtml(item.suggested_take)}
        </p>
        <a href="${item.source_url}" style="font-size: 13px; color: #2563eb;">Read original →</a>
      </td>
    </tr>`
    )
    .join("");

  return `
  <html>
  <body style="margin:0; padding:0; background:#fafafa; font-family: -apple-system, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background: #fff;">
      <tr>
        <td style="padding: 32px 24px 8px;">
          <div style="font-size: 13px; color: #888;">AI Industry Digest &middot; ${dateStr}</div>
          <h1 style="margin: 4px 0 0; font-size: 24px; color: #111;">Top 5 Moves This Cycle</h1>
        </td>
      </tr>
      <tr><td style="padding: 0 24px;"><table width="100%" cellpadding="0" cellspacing="0">${cards}</table></td></tr>
      <tr>
        <td style="padding: 24px; font-size: 12px; color: #999;">
          Auto-generated every ~3 days by your ai-news-digest job.
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
