import { env } from "cloudflare:workers";
import { getRepairMedia } from "../../../../../repairs";

export async function GET(_request: Request, { params }: { params: Promise<{ repairId: string; mediaId: string }> }) {
  const { repairId, mediaId } = await params;
  const media = await getRepairMedia(decodeURIComponent(repairId), decodeURIComponent(mediaId));
  if (!media) return new Response("Not found", { status: 404 });
  const object = await env.UPLOADS.get(media.objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": media.contentType, "Cache-Control": "private, max-age=3600", "Content-Disposition": `inline; filename="${media.originalName.replace(/["\r\n]/g, "")}"` } });
}
