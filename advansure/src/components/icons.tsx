// All icon paths are taken from the Advansure prototype (ui.jsx).
// Stroke-based 24 × 24 grid, strokeLinecap="round", strokeLinejoin="round".

const ICON_PATHS: Record<string, string> = {
  back:         '<path d="M15 5l-7 7 7 7"/>',
  close:        '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron:      '<path d="M9 6l6 6-6 6"/>',
  send:         '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUp:      '<path d="M12 19V5M6 11l6-6 6 6"/>',
  camera:       '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a1 1 0 0 0 .8-.4l1-1.3a1 1 0 0 1 .8-.4h3.4a1 1 0 0 1 .8.4l1 1.3a1 1 0 0 0 .8.4h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><circle cx="12" cy="12.5" r="3.2"/>',
  video:        '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/>',
  mic:          '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  check:        '<path d="M5 12.5l4.5 4.5L19 7"/>',
  checkCircle:  '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  shield:       '<path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z"/>',
  water:        '<path d="M12 3.5c3 4 6 7 6 10.2A6 6 0 0 1 6 13.7C6 10.5 9 7.5 12 3.5z"/>',
  fire:         '<path d="M12 3c.5 3-2 4.5-2 7a2 2 0 1 0 4 0c0-.7-.3-1.3-.3-1.3 2 .8 3.3 2.9 3.3 5.3a5 5 0 0 1-10 0C7 9.5 11 8 12 3z"/>',
  lock:         '<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  storm:        '<path d="M7 16a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3.5 3.5 0 0 1-.5 7"/><path d="M12 13l-2 4h3l-2 4"/>',
  clock:        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  refresh:      '<path d="M20 11a8 8 0 1 0-1.5 5"/><path d="M20 5v6h-6"/>',
  plus:         '<path d="M12 5v14M5 12h14"/>',
  edit:         '<path d="M14 5l5 5M4 20l1-4 11-11 4 4-11 11z"/>',
  trash:        '<path d="M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  sun:          '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:         '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  sparkle:      '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  copy:         '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  // "alert" in prototype — exposed as "warning" per task spec
  warning:      '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  home:         '<path d="M4 11l8-7 8 7M6 10v9h12v-9"/>',
  bell:         '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  stop:         '<rect x="7" y="7" width="10" height="10" rx="2"/>',
  ruler:        '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
  pin:          '<path d="M12 21s7-6.3 7-11a7 7 0 0 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  doc:          '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
  wand:         '<path d="M5 19l9-9M15 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  // aliases for spec names
  x:            '<path d="M6 6l12 12M18 6L6 18"/>',
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function Icon({
  name,
  size = 22,
  color = 'currentColor',
  strokeWidth = 1.8,
  style,
}: IconProps) {
  const pathData = ICON_PATHS[name] ?? '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      // Safe: paths are static strings defined in this file, never from user input
      dangerouslySetInnerHTML={{ __html: pathData }}
      aria-hidden="true"
    />
  );
}
