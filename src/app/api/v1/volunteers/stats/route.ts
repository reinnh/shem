import { NextResponse } from "next/server";
import { createApiResponse, createApiError } from "@/lib/api-response";
import { getVolunteerStatistics } from "@/lib/volunteer-service";

export async function GET() {
  try {
    const stats = await getVolunteerStatistics();
    return createApiResponse(stats, "Statistics calculated successfully", 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load statistics";
    return createApiError(msg, 500);
  }
}
