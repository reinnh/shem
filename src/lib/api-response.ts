import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export function createApiResponse<T>(
  data: T | null,
  message: string,
  statusCode = 200,
  success = true
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success,
      message,
      statusCode,
      data,
    },
    { status: statusCode }
  );
}

export function createApiError(
  message: string,
  statusCode = 400,
  details: unknown = null
): NextResponse<ApiResponse<unknown>> {
  return NextResponse.json(
    {
      success: false,
      message,
      statusCode,
      data: details,
    },
    { status: statusCode }
  );
}
