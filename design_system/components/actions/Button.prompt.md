Pill-shaped primary action button — use for any tap-to-commit action.

```jsx
<Button variant="primary" icon="check" onClick={go}>I'm in</Button>
<Button variant="secondary">Maybe</Button>
<Button variant="ghost" trailingIcon="chevron-right">See all</Button>
<Button variant="primary" size="lg" block loading>Sending invite…</Button>
```

Variants: `primary` (coral + glow, the default CTA), `accent` (amber), `dark` (ink), `secondary` (outline), `ghost` (text-only), `danger` (block/report). Sizes `sm | md | lg`. Pass `block` for full-width, `loading` for a spinner, `icon`/`trailingIcon` as Lucide names.
