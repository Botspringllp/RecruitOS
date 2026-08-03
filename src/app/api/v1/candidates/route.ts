import { NextRequest } from "next/server";
import { saveCandidate } from "@/backend/controllers/candidate-controller";

export async function POST(req: NextRequest) {
  return saveCandidate(req);
}
