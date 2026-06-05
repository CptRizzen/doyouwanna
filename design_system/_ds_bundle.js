/* @ds-bundle: {"format":3,"namespace":"DoYouWannaDesignSystem_3f6d35","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"EventCard","sourcePath":"components/app/EventCard.jsx"},{"name":"RSVPBar","sourcePath":"components/app/RSVPBar.jsx"},{"name":"TabBar","sourcePath":"components/app/TabBar.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Icon","sourcePath":"components/icon/Icon.jsx"},{"name":"Avatar","sourcePath":"components/people/Avatar.jsx"},{"name":"AvatarStack","sourcePath":"components/people/AvatarStack.jsx"},{"name":"Badge","sourcePath":"components/people/Badge.jsx"},{"name":"CircleTag","sourcePath":"components/people/CircleTag.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"ListRow","sourcePath":"components/surfaces/ListRow.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"a228b10e21d4","components/actions/IconButton.jsx":"b3ba69a61f81","components/app/EventCard.jsx":"1a090bd1c39d","components/app/RSVPBar.jsx":"219ee50e6e01","components/app/TabBar.jsx":"63956784d2e8","components/forms/Input.jsx":"cac6f8943ce4","components/forms/SegmentedControl.jsx":"b9307527edf5","components/forms/Switch.jsx":"af5dbd932c05","components/icon/Icon.jsx":"772a7609645b","components/people/Avatar.jsx":"6920515337d2","components/people/AvatarStack.jsx":"9c9caebb64bd","components/people/Badge.jsx":"501241d86ae3","components/people/CircleTag.jsx":"e91e5f5124fb","components/surfaces/Card.jsx":"0c52454bb737","components/surfaces/ListRow.jsx":"24bdc56cd524"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DoYouWannaDesignSystem_3f6d35 = window.DoYouWannaDesignSystem_3f6d35 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/forms/SegmentedControl.jsx
try { (() => {
/**
 * SegmentedControl — iOS-style segmented switcher with a sliding thumb.
 * Use for view toggles (e.g. List / Map, Going / Maybe / Can't).
 */
function SegmentedControl({
  options = [],
  // [{ value, label }] or [string]
  value,
  defaultValue,
  onChange,
  size = 'md',
  style = {}
}) {
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const isControlled = value !== undefined;
  const [val, setVal] = React.useState(defaultValue ?? opts[0]?.value);
  const current = isControlled ? value : val;
  const idx = Math.max(0, opts.findIndex(o => o.value === current));
  const h = size === 'sm' ? 34 : 42;
  const pick = v => {
    if (!isControlled) setVal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      height: h,
      padding: 4,
      background: 'var(--ink-100)',
      borderRadius: 'var(--radius-pill)',
      width: '100%',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      width: `calc((100% - 8px) / ${opts.length})`,
      transform: `translateX(${idx * 100}%)`,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform var(--dur-base) var(--ease-spring)'
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    onClick: () => pick(o.value),
    style: {
      position: 'relative',
      zIndex: 1,
      flex: 1,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: size === 'sm' ? 13 : 14,
      letterSpacing: '-0.01em',
      color: o.value === current ? 'var(--text-strong)' : 'var(--text-muted)',
      transition: 'color var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      WebkitTapHighlightColor: 'transparent'
    }
  }, o.label)));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * Switch — iOS-style toggle. Controlled or uncontrolled. Coral when on.
 * Use for privacy toggles like Discovery and Live location.
 */
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  color = 'var(--primary)',
  size = 'md',
  style = {}
}) {
  const isControlled = checked !== undefined;
  const [on, setOn] = React.useState(defaultChecked);
  const val = isControlled ? checked : on;
  const dims = size === 'sm' ? {
    w: 42,
    h: 26,
    knob: 20
  } : {
    w: 52,
    h: 32,
    knob: 26
  };
  const pad = (dims.h - dims.knob) / 2;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setOn(!val);
    onChange && onChange(!val);
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": val,
    onClick: toggle,
    disabled: disabled,
    style: {
      position: 'relative',
      width: dims.w,
      height: dims.h,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: val ? color : 'var(--ink-300)',
      opacity: disabled ? 0.5 : 1,
      padding: 0,
      transition: 'background var(--dur-base) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: pad,
      left: val ? dims.w - dims.knob - pad : pad,
      width: dims.knob,
      height: dims.knob,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 5px rgba(23,20,15,0.25)',
      transition: 'left var(--dur-base) var(--ease-spring)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/icon/Icon.jsx
try { (() => {
/**
 * Icon — inline Lucide icon (https://lucide.dev).
 * Requires the Lucide UMD script on the page:
 *   <script src="https://unpkg.com/lucide@0.456.0/dist/umd/lucide.min.js"></script>
 *
 * Renders an SVG into a stable, React-owned <span> via innerHTML so it is
 * safe across re-renders (no DOM node replacement that would crash React).
 */
const toPascal = n => n.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    const L = window.lucide;
    if (!host || !L) return;
    const node = L.icons && (L.icons[toPascal(name)] || L.icons[name]) || L[toPascal(name)];
    if (Array.isArray(node)) {
      // lucide tuple form: ["svg", baseAttrs, [ [tag, attrs], ... ]]
      const children = node[0] === 'svg' && Array.isArray(node[2]) ? node[2] : node;
      const base = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
      const inner = children.map(child => {
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
      try {
        L.createIcons({
          attrs: {
            width: size,
            height: size,
            'stroke-width': strokeWidth
          },
          nameAttr: 'data-lucide'
        });
      } catch (e) {}
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    "aria-hidden": "true",
    className: `dyw-icon ${className}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      color,
      flex: 'none',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the primary action primitive.
 * Variants: primary (coral fill + glow), secondary (ink outline),
 * ghost (transparent), accent (amber), danger (red), dark (ink fill).
 * Sizes: sm, md, lg. Pill-shaped by default (the bubbly brand).
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  // lucide name (string) on the left
  trailingIcon,
  // lucide name on the right
  block = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      h: 36,
      px: 16,
      fs: 14,
      gap: 6,
      ic: 16
    },
    md: {
      h: 48,
      px: 22,
      fs: 16,
      gap: 8,
      ic: 19
    },
    lg: {
      h: 56,
      px: 28,
      fs: 17,
      gap: 9,
      ic: 21
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      boxShadow: 'var(--shadow-primary)',
      border: 'none'
    },
    accent: {
      background: 'var(--accent)',
      color: 'var(--ink-900)',
      boxShadow: 'var(--shadow-accent)',
      border: 'none'
    },
    dark: {
      background: 'var(--ink-900)',
      color: 'var(--text-on-dark)',
      boxShadow: 'var(--shadow-md)',
      border: 'none'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-strong)',
      boxShadow: 'none',
      border: '1.5px solid var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--primary)',
      boxShadow: 'none',
      border: 'none'
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
      boxShadow: 'none',
      border: 'none'
    }
  };
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: onClick,
    disabled: disabled || loading,
    className: `dyw-btn dyw-btn--${variant}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.h,
      padding: `0 ${s.px}px`,
      minWidth: s.h,
      width: block ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: s.fs,
      letterSpacing: '-0.01em',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none',
      ...v,
      ...style
    },
    onMouseDown: e => {
      if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.96)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "dyw-btn__spinner",
    style: {
      width: s.ic,
      height: s.ic,
      borderRadius: '50%',
      border: '2.5px solid currentColor',
      borderTopColor: 'transparent',
      animation: 'dyw-spin 0.7s linear infinite',
      opacity: 0.9
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.ic,
    strokeWidth: 2.4
  }), children, trailingIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: trailingIcon,
    size: s.ic,
    strokeWidth: 2.4
  })), /*#__PURE__*/React.createElement("style", null, `@keyframes dyw-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — a square/circular tap target wrapping a single icon.
 * Used for nav bars, toolbars, map controls, close buttons.
 * Shapes: circle (default) | square. Tones: plain, soft, solid, glass, dark.
 */
function IconButton({
  icon,
  size = 44,
  iconSize,
  tone = 'plain',
  shape = 'circle',
  label,
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const tones = {
    plain: {
      background: 'transparent',
      color: 'var(--text-strong)',
      border: 'none'
    },
    soft: {
      background: 'var(--ink-100)',
      color: 'var(--text-strong)',
      border: 'none'
    },
    solid: {
      background: 'var(--primary)',
      color: '#fff',
      border: 'none',
      boxShadow: 'var(--shadow-primary-sm)'
    },
    glass: {
      background: 'var(--glass-light)',
      color: 'var(--ink-900)',
      border: 'none',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    },
    dark: {
      background: 'var(--ink-900)',
      color: '#fff',
      border: 'none'
    }
  };
  const t = tones[tone] || tones.plain;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    disabled: disabled,
    "aria-label": label || icon,
    className: `dyw-iconbtn dyw-iconbtn--${tone}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: shape === 'square' ? 'var(--radius-md)' : 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...t,
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'scale(0.9)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize || Math.round(size * 0.46),
    strokeWidth: 2.2
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/app/RSVPBar.jsx
try { (() => {
/**
 * RSVPBar — the sticky bottom action bar on an event. Switches between
 * the three-state RSVP (Going / Maybe / Can't) and, once you're going,
 * the live "On my way" share toggle.
 */
function RSVPBar({
  state,
  // null | 'going' | 'maybe' | 'cant'
  onRSVP,
  onMyWay,
  onWay = false,
  style = {}
}) {
  const Pill = ({
    value,
    icon,
    label,
    color
  }) => {
    const on = state === value;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => onRSVP && onRSVP(value),
      style: {
        flex: 1,
        height: 50,
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 15,
        border: on ? 'none' : '1.5px solid var(--border-default)',
        background: on ? color : 'var(--surface-card)',
        color: on ? '#fff' : 'var(--text-body)',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        transition: 'all var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: icon,
      size: 18,
      strokeWidth: 2.4
    }), " ", label);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '14px 16px 22px',
      background: 'var(--glass-light)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--border-subtle)',
      ...style
    }
  }, state === 'going' ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: onWay ? 'dark' : 'primary',
    size: "lg",
    block: true,
    icon: onWay ? 'navigation' : 'navigation',
    onClick: onMyWay
  }, onWay ? "You're on the way · sharing live" : "I'm on my way") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Pill, {
    value: "going",
    icon: "check",
    label: "I'm in",
    color: "var(--primary)"
  }), /*#__PURE__*/React.createElement(Pill, {
    value: "maybe",
    icon: "circle-help",
    label: "Maybe",
    color: "var(--warning)"
  }), /*#__PURE__*/React.createElement(Pill, {
    value: "cant",
    icon: "x",
    label: "Can't",
    color: "var(--ink-700)"
  })));
}
Object.assign(__ds_scope, { RSVPBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/RSVPBar.jsx", error: String((e && e.message) || e) }); }

// components/app/TabBar.jsx
try { (() => {
/**
 * TabBar — the iOS bottom navigation. A center "create" action can be
 * raised into a floating coral button. Frosted-glass background.
 */
function TabBar({
  items = [],
  // [{ key, icon, label, badge }]
  active,
  onChange,
  raisedCenter = true,
  // raise the middle item as a coral FAB
  style = {}
}) {
  const centerIdx = raisedCenter ? Math.floor(items.length / 2) : -1;
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      padding: '10px 8px 0',
      height: 'var(--tabbar-height)',
      boxSizing: 'border-box',
      background: 'var(--glass-light)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--border-subtle)',
      ...style
    }
  }, items.map((it, i) => {
    const on = it.key === active;
    if (i === centerIdx) {
      return /*#__PURE__*/React.createElement("button", {
        key: it.key,
        onClick: () => onChange && onChange(it.key),
        "aria-label": it.label,
        style: {
          position: 'relative',
          top: -14,
          width: 58,
          height: 58,
          borderRadius: 'var(--radius-pill)',
          border: '4px solid var(--surface-page)',
          background: 'var(--primary)',
          color: '#fff',
          boxShadow: 'var(--shadow-primary)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: it.icon,
        size: 26,
        strokeWidth: 2.6
      }));
    }
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onChange && onChange(it.key),
      "aria-label": it.label,
      style: {
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        flex: 1,
        padding: '2px 0',
        color: on ? 'var(--primary)' : 'var(--text-subtle)',
        WebkitTapHighlightColor: 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 24,
      strokeWidth: on ? 2.6 : 2.1
    }), it.badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--primary)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--surface-page)',
        boxSizing: 'border-box'
      }
    }, it.badge)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.01em'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field with optional label, leading Lucide icon, helper/error.
 * Soft warm well by default; focuses with a coral ring.
 */
function Input({
  label,
  value,
  defaultValue,
  placeholder,
  icon,
  type = 'text',
  helper,
  error,
  disabled = false,
  onChange,
  trailing,
  // node rendered at the right (e.g. a clear button)
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderCol = error ? 'var(--danger)' : focus ? 'var(--primary)' : 'transparent';
  const ring = error ? 'rgba(224,50,43,0.18)' : focus ? 'var(--focus-ring)' : 'transparent';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 13,
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: '0 16px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      border: `1.5px solid ${borderCol}`,
      boxShadow: `0 0 0 4px ${ring}`,
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.5 : 1
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20,
    color: focus ? 'var(--primary)' : 'var(--text-muted)',
    strokeWidth: 2.2
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 16,
      fontWeight: 500,
      color: 'var(--text-strong)',
      minWidth: 0,
      ...inputStyle
    }
  }, rest)), trailing), (helper || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      fontWeight: 500,
      color: error ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/people/Avatar.jsx
try { (() => {
/**
 * Avatar — a person. Photo with graceful fallback to initials on a
 * circle-colored disc. Optional colored ring (their circle) and a
 * status dot (online / on-my-way / live).
 */
function Avatar({
  src,
  name = '',
  size = 44,
  ring,
  // circle color token value, e.g. 'var(--circle-teal)'
  status,
  // 'online' | 'away' | 'live' | undefined
  color,
  // fallback disc color
  style = {}
}) {
  const [failed, setFailed] = React.useState(false);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const discColors = ['var(--circle-coral)', 'var(--circle-teal)', 'var(--circle-grape)', 'var(--circle-sky)', 'var(--circle-amber)', 'var(--circle-rose)'];
  const disc = color || discColors[(name.charCodeAt(0) || 0) % discColors.length];
  const statusColors = {
    online: 'var(--success)',
    live: 'var(--live)',
    away: 'var(--amber-400)'
  };
  const ringW = Math.max(2, Math.round(size * 0.06));
  const dot = Math.max(9, Math.round(size * 0.26));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: disc,
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: size * 0.4,
      letterSpacing: '-0.02em',
      boxSizing: 'border-box',
      border: ring ? `${ringW}px solid ${ring}` : 'none',
      boxShadow: ring ? '0 0 0 2px var(--surface-card)' : 'none'
    }
  }, src && !failed ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    onError: () => setFailed(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", null, initials || '?')), status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: dot,
      height: dot,
      borderRadius: '50%',
      background: statusColors[status] || 'var(--success)',
      border: '2.5px solid var(--surface-card)',
      boxSizing: 'border-box'
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/people/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/people/AvatarStack.jsx
try { (() => {
/**
 * AvatarStack — overlapping row of people who are going / in a circle,
 * with an optional "+N" overflow chip. The signature "who's coming" UI.
 */
function AvatarStack({
  people = [],
  // [{ src, name }]
  size = 28,
  max = 4,
  total,
  // optional explicit total; else people.length
  label,
  // optional trailing text e.g. "going"
  style = {}
}) {
  const shown = people.slice(0, max);
  const count = (total != null ? total : people.length) - shown.length;
  const overlap = Math.round(size * 0.32);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      marginLeft: i === 0 ? 0 : -overlap,
      position: 'relative',
      zIndex: i
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    src: p.src,
    name: p.name,
    size: size,
    style: {
      boxShadow: '0 0 0 2.5px var(--surface-card)',
      borderRadius: '50%'
    }
  }))), count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -overlap,
      height: size,
      minWidth: size,
      padding: '0 7px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--ink-900)',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: size * 0.38,
      boxShadow: '0 0 0 2.5px var(--surface-card)',
      position: 'relative',
      zIndex: 99
    }
  }, "+", count)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { AvatarStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/people/AvatarStack.jsx", error: String((e && e.message) || e) }); }

// components/people/Badge.jsx
try { (() => {
/**
 * Badge — compact status/count token. Tones map to the status palette.
 * Use `dot` for a tiny indicator, `count` for numeric notification badges.
 */
function Badge({
  children,
  tone = 'neutral',
  // neutral | primary | success | live | warning | danger | info
  variant = 'soft',
  // soft | solid | outline
  size = 'md',
  // sm | md
  dot = false,
  icon,
  // small leading glyph node
  style = {}
}) {
  const palette = {
    neutral: {
      soft: ['var(--ink-100)', 'var(--text-body)'],
      solid: ['var(--ink-900)', '#fff'],
      base: 'var(--ink-400)'
    },
    primary: {
      soft: ['var(--primary-soft)', 'var(--coral-700)'],
      solid: ['var(--primary)', '#fff'],
      base: 'var(--primary)'
    },
    success: {
      soft: ['var(--success-soft)', 'var(--green-600)'],
      solid: ['var(--success)', '#fff'],
      base: 'var(--success)'
    },
    live: {
      soft: ['var(--success-soft)', 'var(--green-600)'],
      solid: ['var(--live)', '#fff'],
      base: 'var(--live)'
    },
    warning: {
      soft: ['var(--warning-soft)', 'var(--amber-700)'],
      solid: ['var(--warning)', 'var(--ink-900)'],
      base: 'var(--warning)'
    },
    danger: {
      soft: ['var(--danger-soft)', 'var(--red-600)'],
      solid: ['var(--danger)', '#fff'],
      base: 'var(--danger)'
    },
    info: {
      soft: ['var(--info-soft)', 'var(--sky-600)'],
      solid: ['var(--info)', '#fff'],
      base: 'var(--info)'
    }
  };
  const p = palette[tone] || palette.neutral;
  const s = size === 'sm' ? {
    h: 18,
    fs: 11,
    px: 7
  } : {
    h: 22,
    fs: 12,
    px: 9
  };
  const isLive = tone === 'live';
  let bg,
    fg,
    border = 'none';
  if (variant === 'solid') {
    [bg, fg] = p.solid;
  } else if (variant === 'outline') {
    bg = 'transparent';
    fg = p.soft[1];
    border = `1.5px solid ${p.base}`;
  } else {
    [bg, fg] = p.soft;
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: s.h,
      padding: `0 ${s.px}px`,
      borderRadius: 'var(--radius-pill)',
      border,
      background: bg,
      color: fg,
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: s.fs,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: isLive ? 'dyw-livedot' : undefined,
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: variant === 'solid' ? '#fff' : p.base,
      flex: 'none'
    }
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/people/Badge.jsx", error: String((e && e.message) || e) }); }

// components/app/EventCard.jsx
try { (() => {
/**
 * EventCard — the signature hero unit: activity photo, bottom-up scrim,
 * a glass circle tag, the time/title, and a "who's going" stack.
 * `layout="hero"` (tall) or `layout="row"` (compact horizontal).
 */
function EventCard({
  image,
  title,
  circle,
  // { name, color }
  time,
  going = [],
  goingTotal,
  distance,
  live = false,
  onClick,
  layout = 'hero',
  style = {}
}) {
  const tag = circle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 28,
      padding: '0 11px 0 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--glass-light)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 12,
      color: 'var(--ink-900)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: circle.color || 'var(--circle-coral)'
    }
  }), circle.name);
  if (layout === 'row') {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClick,
      style: {
        display: 'flex',
        gap: 13,
        alignItems: 'center',
        padding: 10,
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 76,
        height: 76,
        borderRadius: 'var(--radius-md)',
        flex: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#FF7855,#C22E13)'
      }
    }, image && /*#__PURE__*/React.createElement("img", {
      src: image,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: circle?.color || 'var(--circle-coral)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, circle?.name), live && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      tone: "live",
      dot: true,
      size: "sm"
    }, "Live")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 16,
        color: 'var(--text-strong)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-muted)',
        fontWeight: 600
      }
    }, time), distance && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-subtle)'
      }
    }, "\xB7 ", distance), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.AvatarStack, {
      people: going,
      size: 22,
      max: 3,
      total: goingTotal
    })))));
  }
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      position: 'relative',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      aspectRatio: '4 / 3',
      minHeight: 200,
      background: 'linear-gradient(135deg,#FF7855,#C22E13)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-photo)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, tag, live && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "live",
    variant: "solid",
    dot: true
  }, "Live now")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 15,
      color: '#fff'
    }
  }, time && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      opacity: 0.92
    }
  }, time), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 22,
      lineHeight: 1.1,
      marginTop: 3
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 11
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AvatarStack, {
    people: going,
    size: 26,
    max: 4,
    total: goingTotal,
    label: goingTotal ? `${goingTotal} going` : undefined,
    style: {
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.3))'
    }
  }), distance && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 13,
      fontWeight: 600,
      opacity: 0.95
    }
  }, distance))));
}
Object.assign(__ds_scope, { EventCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/EventCard.jsx", error: String((e && e.message) || e) }); }

// components/people/CircleTag.jsx
try { (() => {
/**
 * CircleTag — a pill identifying a friend circle by its color + name.
 * Used as a chip on cards, filters, and headers. Selectable variant
 * for filter rows.
 */
function CircleTag({
  name,
  color = 'var(--circle-coral)',
  size = 'md',
  selected = false,
  onClick,
  icon,
  // optional small leading glyph (emoji/char) instead of dot
  style = {}
}) {
  const sizes = {
    sm: {
      h: 26,
      fs: 12,
      px: 9,
      dot: 8
    },
    md: {
      h: 32,
      fs: 13,
      px: 11,
      dot: 9
    },
    lg: {
      h: 38,
      fs: 14,
      px: 13,
      dot: 10
    }
  };
  const s = sizes[size] || sizes.md;
  const clickable = !!onClick;
  return /*#__PURE__*/React.createElement("span", {
    onClick: onClick,
    role: clickable ? 'button' : undefined,
    className: "dyw-circletag",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      height: s.h,
      padding: `0 ${s.px + 2}px 0 ${s.px}px`,
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: s.fs,
      cursor: clickable ? 'pointer' : 'default',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      background: selected ? color : 'var(--ink-100)',
      color: selected ? '#fff' : 'var(--text-body)',
      boxShadow: selected ? 'var(--shadow-sm)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: s.fs + 1
    }
  }, icon) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: s.dot,
      height: s.dot,
      borderRadius: '50%',
      background: selected ? 'rgba(255,255,255,0.9)' : color,
      flex: 'none'
    }
  }), name);
}
Object.assign(__ds_scope, { CircleTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/people/CircleTag.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the default white rounded surface. Optional pressable behavior
 * (scales on tap), selectable border, and padding control.
 */
function Card({
  children,
  elevation = 'md',
  // none | sm | md | lg
  padding = 16,
  radius = 'var(--radius-card)',
  pressable = false,
  selected = false,
  onClick,
  style = {},
  ...rest
}) {
  const shadows = {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)'
  };
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseDown: () => pressable && setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    style: {
      background: 'var(--surface-card)',
      borderRadius: radius,
      padding,
      boxShadow: shadows[elevation] ?? shadows.md,
      border: selected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
      cursor: pressable || onClick ? 'pointer' : 'default',
      transform: pressed ? 'scale(0.985)' : 'scale(1)',
      transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ListRow.jsx
try { (() => {
/**
 * ListRow — a settings / menu / detail row. Leading icon in a colored
 * tile, title + optional subtitle, and a trailing slot (chevron, value,
 * switch, badge). Tap target ≥ 56px.
 */
function ListRow({
  icon,
  iconColor = 'var(--primary)',
  iconBg,
  // defaults to a tint of iconColor
  leading,
  // custom leading node (e.g. Avatar) overrides icon
  title,
  subtitle,
  value,
  // right-aligned muted text
  trailing,
  // custom right node (Switch, Badge…)
  chevron = false,
  danger = false,
  onClick,
  divider = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      minHeight: 56,
      padding: '10px 4px',
      cursor: onClick ? 'pointer' : 'default',
      borderBottom: divider ? '1px solid var(--divider)' : 'none',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, leading || icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: iconBg || (danger ? 'var(--danger-soft)' : `color-mix(in srgb, ${iconColor} 15%, white)`),
      color: danger ? 'var(--danger)' : iconColor
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20,
    strokeWidth: 2.2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 15.5,
      color: danger ? 'var(--danger)' : 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, subtitle)), value && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text-muted)',
      flex: 'none'
    }
  }, value), trailing, chevron && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 20,
    color: "var(--text-subtle)",
    strokeWidth: 2.4
  }));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ListRow.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.EventCard = __ds_scope.EventCard;

__ds_ns.RSVPBar = __ds_scope.RSVPBar;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarStack = __ds_scope.AvatarStack;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.CircleTag = __ds_scope.CircleTag;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ListRow = __ds_scope.ListRow;

})();
