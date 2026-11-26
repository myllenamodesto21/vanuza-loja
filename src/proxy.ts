import type { NextRequest } from "next/server";

import { protegerGestao } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return protegerGestao(request);
}

export const config = {
  matcher: ["/gestao/:caminho*"],
};
