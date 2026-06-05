People & status primitives — avatars, "who's going" stacks, circle pills, status badges.

```jsx
<Avatar src={url} name="Maya Lopez" size={48} ring="var(--circle-teal)" status="live" />
<AvatarStack people={crew} max={4} total={9} label="going" />
<CircleTag name="Hiking Crew" color="var(--circle-lime)" />
<Badge tone="live" dot>Sharing</Badge>
<Badge tone="primary" variant="solid">3</Badge>
```

- `Avatar` falls back to colored initials if `src` fails. `ring` = the person's circle color; `status` = online | away | live.
- `AvatarStack` overlaps faces and appends +N from `total`.
- `CircleTag` is the friend-circle pill; pass `selected` for active filters.
- `Badge` tones map to the status palette; `live` pulses.
