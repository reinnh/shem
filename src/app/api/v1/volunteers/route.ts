import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiResponse, createApiError } from "@/lib/api-response";
import { createVolunteer, getVolunteers } from "@/lib/volunteer-service";
import { matunguWards } from "@/constants/matungu-wards";

const volunteerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  phoneNumber: z
    .string()
    .min(9, "Valid phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+0-9\s-]{9,20}$/, "Invalid phone format"),
  ward: z.enum(["Koyonzo", "Mayoni", "Namamali", "Kholera", "Khalaba"], {
    errorMap: () => ({ message: "Please select a valid Matungu ward" }),
  }),
  pollingStation: z
    .string()
    .min(2, "Please select your landmark"),
  isOtherStation: z.boolean().optional().default(false),
  volunteerRole: z.string().max(100).optional().default("Mobilizer"),
  isCommitted: z.boolean().optional().default(true),
  occupation: z.string().max(120).optional(),
  educationLevel: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = volunteerSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Validation failed";
      return createApiError(firstError, 422, validated.error.format());
    }

    // Verify landmark belongs to the selected ward — unless "Other" was selected
    if (!validated.data.isOtherStation) {
      const wardData = matunguWards.find((w) => w.ward === validated.data.ward);
      if (!wardData || !wardData.pollingStations.includes(validated.data.pollingStation)) {
        return createApiError(
          `Selected landmark '${validated.data.pollingStation}' is not in ${validated.data.ward} ward.`,
          422
        );
      }
    }

    const volunteer = await createVolunteer(validated.data);
    return createApiResponse(
      volunteer,
      "Volunteer registered successfully! Welcome to Team Hon. Shemaiah Kong'ani.",
      201
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Failed to register volunteer";
    const statusCode = errMessage.includes("already registered") ? 409 : 500;
    return createApiError(errMessage, statusCode);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ward = searchParams.get("ward") || undefined;
    const pollingStation = searchParams.get("pollingStation") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const list = await getVolunteers({
      ward,
      pollingStation,
      search,
      status,
    });

    return createApiResponse(list, "Volunteers retrieved successfully", 200);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return createApiError(errMessage, 500);
  }
}
