Composite app components that make Do You Wanna recognizable.

```jsx
<EventCard image={url} title="Sunrise at Eagle Peak" time="SAT · 7:00 AM"
  circle={{name:'Hiking Crew', color:'var(--circle-lime)'}}
  going={crew} goingTotal={9} distance="2.4 km" />

<EventCard layout="row" title="Trivia night" circle={{name:'Trivia Gang',color:'var(--circle-grape)'}}
  time="Thu 7:30" going={crew} live />

<TabBar active="map" onChange={setTab} items={[
  {key:'home',icon:'house',label:'Home'},
  {key:'circles',icon:'users-round',label:'Circles',badge:2},
  {key:'create',icon:'plus',label:'Plan'},
  {key:'map',icon:'map',label:'Nearby'},
  {key:'me',icon:'user-round',label:'You'},
]} />

<RSVPBar state={state} onRSVP={setState} onWay={onWay} onMyWay={()=>setWay(true)} />
```

- `EventCard` `hero` = tall photo card; `row` = compact list item.
- `TabBar` raises the middle item into a coral FAB by default.
- `RSVPBar` shows three-state RSVP, then swaps to the live "on my way" button once you're going.
