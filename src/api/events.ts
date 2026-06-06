import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Database, EventVisibility } from '@/types/database.types';

type EventRow = Database['public']['Tables']['events']['Row'];

export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  circles: (id: string) => ['events', id, 'circles'] as const,
};

/** Events visible to the current user (RLS: creator, broadcast circle, or discoverable). */
export function useEvents() {
  return useQuery({
    queryKey: eventKeys.all,
    queryFn: async (): Promise<EventRow[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    enabled: !!id,
    queryFn: async (): Promise<EventRow> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export interface CreateEventInput {
  title: string;
  description?: string;
  activity_tags?: string[];
  visibility?: EventVisibility;
  starts_at?: string | null;
  is_checkin?: boolean;
  location?: { latitude: number; longitude: number } | null;
  place_name?: string | null;
  photo_url?: string | null;
  /** Circles to broadcast this event to. */
  circleIds: string[];
}

export type EventWithRsvp = EventRow & { my_rsvp: string | null };

/** Events visible to current user, joined with user's own RSVP status.
 *  Sorted: RSVP'd (going/maybe/invited) first, then open plans. */
export function useEventsWithRsvp() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...eventKeys.all, 'with-rsvp', user?.id] as const,
    enabled: !!user,
    queryFn: async (): Promise<EventWithRsvp[]> => {
      const [{ data: events, error: evErr }, { data: rsvps, error: rvErr }] = await Promise.all([
        supabase.from('events').select('*').order('starts_at', { ascending: true, nullsFirst: false }),
        supabase.from('event_attendees').select('event_id, rsvp_status').eq('user_id', user!.id),
      ]);
      if (evErr) throw evErr;
      if (rvErr) throw rvErr;
      const rsvpMap = new Map((rsvps ?? []).map((r) => [r.event_id, r.rsvp_status]));
      const all: EventWithRsvp[] = (events ?? []).map((e) => ({
        ...e,
        my_rsvp: rsvpMap.get(e.id) ?? null,
      }));
      return all.sort((a, b) => {
        const rank = (r: string | null) => (r === 'going' || r === 'maybe' ? 0 : r === 'invited' ? 1 : 2);
        return rank(a.my_rsvp) - rank(b.my_rsvp);
      });
    },
  });
}

/**
 * Create an event, broadcast it to the chosen circles, and add the creator as a
 * 'going' attendee. Mirrors the events / event_circles / event_attendees RLS
 * insert rules.
 */
export function useCreateEvent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: CreateEventInput): Promise<EventRow> => {
      if (!user) throw new Error('Not authenticated');

      const locationWkt = input.location
        ? `POINT(${input.location.longitude} ${input.location.latitude})`
        : null;

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          creator_id: user.id,
          title: input.title,
          description: input.description ?? null,
          activity_tags: input.activity_tags ?? [],
          visibility: input.visibility ?? 'circles_only',
          starts_at: input.starts_at ?? null,
          is_checkin: input.is_checkin ?? input.starts_at == null,
          location: locationWkt,
          place_name: input.place_name ?? null,
          photo_url: input.photo_url ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      if (input.circleIds.length > 0) {
        const { error: ecErr } = await supabase
          .from('event_circles')
          .insert(input.circleIds.map((circle_id) => ({ event_id: event.id, circle_id })));
        if (ecErr) throw ecErr;
      }

      const { error: attErr } = await supabase
        .from('event_attendees')
        .insert({ event_id: event.id, user_id: user.id, rsvp_status: 'going' });
      if (attErr) throw attErr;

      return event;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
