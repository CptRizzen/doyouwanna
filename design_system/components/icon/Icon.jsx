import React from 'react';

/**
 * Icon — inline Lucide icon (https://lucide.dev).
 * Requires the Lucide UMD script on the page:
 *   <script src="https://unpkg.com/lucide@0.456.0/dist/umd/lucide.min.js"></script>
 *
 * Renders an SVG into a stable, React-owned <span> via innerHTML so it is
 * safe across re-renders (no DOM node replacement that would crash React).
 */
const toPascal = (n) => n.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
  style = {},
}) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const host = ref.current;
    const L = window.lucide;
    if (!host || !L) return;
    const node = (L.icons && (L.icons[toPascal(name)] || L.icons[name])) || L[toPascal(name)];

    if (Array.isArray(node)) {
      // lucide tuple form: ["svg", baseAttrs, [ [tag, attrs], ... ]]
      const children = (node[0] === 'svg' && Array.isArray(node[2])) ? node[2] : node;
      const base = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
      const inner = children.map((child) => {
        if (!Array.isArray(child)) return '';
        const [tag, attrs = {}] = child;
        if (typeof tag !== 'string') return '';
        const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
        return `<${tag} ${a}/>`;
      }).join('');
      host.innerHTML = `<svg ${base}>${inner}</svg>`;
    } else {
      // Fallback: placeholder + global createIcons (older/edge builds)
      host.innerHTML = `<i data-lucide="${name}"></i>`;
      try { L.createIcons({ attrs: { width: size, height: size, 'stroke-width': strokeWidth }, nameAttr: 'data-lucide' }); } catch (e) {}
    }
  }, [name, size, strokeWidth]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`dyw-icon ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flex: 'none', ...style }}
    />
  );
}
