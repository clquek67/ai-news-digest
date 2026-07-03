import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateDigest } from "@/lib/generate-digest";
import { buildEmailHtml } from "@/lib/email-template";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  // Protect the cron endpoint. Vercel Cron sends this header automatically.
  const authHeader = req.headers.get("authorization");
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const force = req.nextUrl.searchParams.get("force") === "true";

  if (!isVercelCron && !force) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check when we last sent
  const { data: lastLog } = await supabase
    .from("digest_log")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  const lastSentAt = lastLog?.sent_at ? new Date(lastLog.sent_at).getTime() : 0;
  const elapsed = Date.now() - lastSentAt;

  if (!force && elapsed < THREE_DAYS_MS) {
    return NextResponse.json({
      skipped: true,
      reason: `Only ${(elapsed / 3.6e6).toFixed(1)}h since last send, need 72h`,
    });
  }

  try {
    const items = await generateDigest();

    const dateStr = new Date().toLocaleDateString("en-SG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = buildEmailHtml(items, dateStr);

    await resend.emails.send({
      from: process.env.EMAIL_FROM!, // e.g. "AI Digest <digest@yourdomain.com>"
      to: process.env.EMAIL_TO!, // your inbox
      subject: `AI Industry Digest — Top 5 (${dateStr})`,
      html,
    });

    await supabase.from("digest_log").insert({
      sent_at: new Date().toISOString(),
      item_count: items.length,
      raw_json: items,
    });

    return NextResponse.json({ success: true, items: items.length });
  } catch (err: any) {
    console.error("Digest generation failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
