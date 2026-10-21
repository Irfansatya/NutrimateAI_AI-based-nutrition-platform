import { NextResponse } from "next/server";

export function errorResponse(
  message: string,
  statusCode = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(code ? { code } : {}),
    },
    { status: statusCode }
  );
}

export function successResponse<T>(
  message: string,
  data?: T,
  statusCode = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data !== undefined ? { data } : {}),
    },
    { status: statusCode }
  );
}
