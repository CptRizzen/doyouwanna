import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ExpoLocation from 'expo-location';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { GeoPoint } from '@/domain/location';

export const locationKeys = {
  eventLocations: (eventId: string) => ['locations', 'event', eventId] as const,
};

export type AttendeeLocation = {
  id: string;
  event_id: string;
  user_id: string;
  rsvp_status: string;
  live_location: string | null;
  live_location_updated_at: string | null;
};

/** Fetch + realtime-subscribe to visible attendee locations for an event. */
export function useEventAttendeeLocations(eventId: string) {
  const qc = useQueryClient();
  const key = locationKeys.eventLocations(eventId);

  const query = useQuery({
    queryKey: key,
    enabled: !!eventId,
    queryFn: async (): Promise<AttendeeLocation[]> => {
      const { data, error } = await supabase
        .from('visible_attendee_locations')
        .select('*')
        .eq('event_id', eventId);
      if (error) throw error;
      return (data ?? []) as AttendeeLocation[];
    },
  });

  useEffect(() => {
    if (!eventId) return;
    const channel = supabase
      .channel(`locs-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_attendees',
          filter: `event_id=eq.${eventId}`,
        },
        () => qc.invalidateQueries({ queryKey: key }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  return query;
}

/** Broadcast current user's position to their event_attendees row. */
export function useBroadcastLocation(eventId: string) {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (coords: GeoPoint) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('event_attendees')
        .update({
          live_location: `POINT(${coords.longitude} ${coords.latitude})`,
          live_location_updated_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
  });
}

/**
 * Watches device location and broadcasts it to an event while active.
 * Returns { sharing, toggle, error }.
 */
export function useLocationSharing(eventId: string) {
  const [sharing, setSharing] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const broadcast = useBroadcastLocation(eventId);
  const watchRef = useRef<ExpoLocation.LocationSubscription | null>(null);

  const start = async () => {
    setPermError(null);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermError('Location permission denied');
        return;
      }
      watchRef.current = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Balanced,
          timeInterval: 15_000,
          distanceInterval: 20,
        },
        (loc) =>
          broadcast.mutate({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }),
      );
      setSharing(true);
    } catch (e) {
      setPermError(e instanceof Error ? e.message : 'Location error');
    }
  };

  const stop = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setSharing(false);
  };

  const toggle = () => (sharing ? stop() : start());

  // Cleanup on unmount
  useEffect(() => () => { stop(); }, []);

  return { sharing, toggle, error: permError };
}
