import { listPublishedReviews } from "../../repairs";

export async function GET() {
  try {
    return Response.json({ reviews: await listPublishedReviews() }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (error) {
    console.error("Unable to load published reviews", error);
    return Response.json({ reviews: [] });
  }
}
