import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}
export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}
export function noContent() {
  return new NextResponse(null, { status: 204 });
}
export const errors = {
  badRequest: (message = "Bad Request", details?: any) =>
    NextResponse.json(
      { success: false, error: { message, code: "BAD_REQUEST", details } },
      { status: 400 }
    ),
  unauthorized: (message = "Unauthorized") =>
    NextResponse.json(
      { success: false, error: { message, code: "UNAUTHORIZED" } },
      { status: 401 }
    ),
  notFound: (message = "Not Found") =>
    NextResponse.json(
      { success: false, error: { message, code: "NOT_FOUND" } },
      { status: 404 }
    ),
  internal: (message = "Internal Server Error", details?: any) =>
    NextResponse.json(
      { success: false, error: { message, code: "INTERNAL_ERROR", details } },
      { status: 500 }
    ),
};
