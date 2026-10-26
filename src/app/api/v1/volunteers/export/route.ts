import { NextRequest, NextResponse } from "next/server";
import { getVolunteers } from "@/lib/volunteer-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ward = searchParams.get("ward") || undefined;
    const pollingStation = searchParams.get("pollingStation") || undefined;

    const list = await getVolunteers({ ward, pollingStation });

    // Build CSV
    const headers = [
      "ID",
      "Full Name",
      "Phone Number",
      "Ward",
      "Polling Station",
      "Status",
      "Registration Date",
      "Notes",
    ];

    const rows = list.map((v) => [
      `"${v._id}"`,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${v.phoneNumber}"`,
      `"${v.ward}"`,
      `"${v.pollingStation.replace(/"/g, '""')}"`,
      `"${v.status}"`,
      `"${new Date(v.createdAt).toLocaleDateString()}"`,
      `"${(v.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `matungu-volunteers-${ward || "all"}-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Export failed";
    return new NextResponse(msg, { status: 500 });
  }
}
