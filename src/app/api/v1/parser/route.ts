import { NextRequest } from "next/server";
import { parseResume } from "@/backend/controllers/parser-controller";

export async function POST(req: NextRequest) {
  return parseResume(req);
}
