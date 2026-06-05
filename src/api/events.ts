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
  /** Circles to broadcast this event to. */
  circleIds: string[];
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
