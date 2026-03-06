import { type ReactNode } from "react";
import { SUN_FACTORY_URL, ACCERTS_URL } from "./site";

const COMPANIES: [string, string][] = [
  ["Sun Factory", SUN_FACTORY_URL],
  ["Accerts Productions", ACCERTS_URL],
];

const linkClass =
  "underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60";

export function linkifyCompanies(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let matchedName = "";
    let matchedUrl = "";

    for (const [name, url] of COMPANIES) {
      const idx = remaining.indexOf(name);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        matchedName = name;
        matchedUrl = url;
      }
    }

    if (earliest === -1) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) parts.push(remaining.slice(0, earliest));

    parts.push(
      <a
        key={key++}
        href={matchedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {matchedName}
      </a>,
    );

    remaining = remaining.slice(earliest + matchedName.length);
  }

  return <>{parts}</>;
}
