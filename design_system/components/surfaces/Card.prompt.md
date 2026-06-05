Container surfaces — the rounded white Card and the ListRow for settings/menus.

```jsx
<Card elevation="md" padding={18}>…</Card>
<Card pressable onClick={open}>…</Card>

<ListRow icon="bell" title="Notifications" subtitle="Pings when friends head out" chevron onClick={go} />
<ListRow icon="radar" iconColor="var(--circle-grape)" title="Discovery" trailing={<Switch checked={on} onChange={set} />} />
<ListRow icon="shield-alert" title="Block & report" danger chevron />
```

- `Card` is the default surface (white, --radius-card, --shadow-md). `pressable` adds tap-scale.
- `ListRow` renders a colored icon tile + title/subtitle; drop a Switch/Badge/Button into `trailing`, or set `chevron`.
