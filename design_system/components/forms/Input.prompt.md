Form controls — text input, iOS toggle, segmented switcher.

```jsx
<Input label="Circle name" icon="users" placeholder="Hiking Crew" />
<Input label="Email" icon="mail" error="That doesn't look right" />
<Switch checked={discovery} onChange={setDiscovery} />
<SegmentedControl options={['List','Map']} defaultValue="List" onChange={setView} />
```

- `Input` focuses with a coral ring; pass `error` to flip to danger.
- `Switch` is coral when on — use for Discovery / Live-location privacy toggles.
- `SegmentedControl` slides a thumb; great for List/Map or RSVP states.
