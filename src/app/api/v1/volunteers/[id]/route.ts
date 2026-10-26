import { NextRequest } from "next/server";
import { createApiResponse, createApiError } from "@/lib/api-response";
import { deleteVolunteer, updateVolunteerStatus } from "@/lib/volunteer-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return createApiError("Volunteer ID is required", 400);
    }

    const deleted = await deleteVolunteer(id);
    if (!deleted) {
      return createApiError("Volunteer not found or already removed", 404);
    }

    return createApiResponse({ deletedId: id }, "Volunteer deleted successfully", 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete volunteer";
    return createApiError(msg, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!["verified", "active", "flagged"].includes(body.status)) {
      return createApiError("Invalid status value", 400);
    }

    const updated = await updateVolunteerStatus(id, body.status);
    if (!updated) {
      return createApiError("Volunteer not found", 404);
    }

    return createApiResponse(updated, "Status updated successfully", 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update status";
    return createApiError(msg, 500);
  }
}
