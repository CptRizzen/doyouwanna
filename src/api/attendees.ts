import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { RsvpStatus } from '@/domain/types';

type Attendee = Database['public']['Tables']['event_attendees']['Row'];

export const attendeeKeys = {
  forEvent: (eventId: string) => ['events', eventId, 'attendees'] as const,
  mine: (eventId: string, userId: string) =>
    ['events', eventId, 'attendees', userId] as const,
};

export interface AttendeeWithProfile {
  id: string;
  user_id: string;
  rsvp_status: RsvpStatus;
  profile: { username: string; display_name: string | null } | null;
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: attendeeKeys.forEvent(eventId),
    enabled: !!eventId,
    queryFn: async (): Promise<AttendeeWithProfile[]> => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id, user_id, rsvp_status, profile:profiles(username, display_name)')
        .eq('event_id', eventId);
      if (error) throw error;
      return (data ?? []) as unknown as AttendeeWithProfile[];
    },
  });
}

/** The current user's own attendee row for an event, if any. */
export function useMyRsvp(eventId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: attendeeKeys.mine(eventId, user?.id ?? 'anon'),
    enabled: !!eventId && !!user,
    queryFn: async (): Promise<Attendee | null> => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Upsert the current user's RSVP status for an event. */
export function useSetRsvp(eventId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (status: RsvpStatus) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('event_attendees')
        .upsert(
          { event_id: eventId, user_id: user.id, rsvp_status: status },
          { onConflict: 'event_id,user_id' },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendeeKeys.forEvent(eventId) });
      qc.invalidateQueries({
        queryKey: attendeeKeys.mine(eventId, user?.id ?? 'anon'),
      });
    },
  });
}
