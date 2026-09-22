import { BarChart3, FileSearch, History, Microscope, ScanLine } from "lucide-react";
import { NAV } from "@/lib/constants";

const ICONS = { "/overview": BarChart3, "/analyze": ScanLine, "/evidence": FileSearch, "/history": History, "/technology": Microscope } as const;

export const NAV_ITEMS = NAV.map((n, i) => ({ ...n, index: String(i + 1).padStart(2, "0"), Icon: ICONS[n.href] }));

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
