import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Invite = Database['public']['Tables']['invites']['Row'];

export const inviteKeys = {
  forCircle: (circleId: string) => ['invites', 'circle', circleId] as const,
  forEvent: (eventId: string) => ['invites', 'event', eventId] as const,
};

export interface CreateInviteInput {
  email: string;
  circleId?: string;
  eventId?: string;
}

/** Create an invite row and fire the send-invite Edge Function. */
export function useCreateInvite() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ email, circleId, eventId }: CreateInviteInput): Promise<Invite> => {
      if (!user) throw new Error('Not authenticated');
      if (!circleId && !eventId) throw new Error('Must provide circleId or eventId');

      const { data, error } = await supabase
        .from('invites')
        .insert({
          email: email.trim().toLowerCase(),
          inviter_id: user.id,
          circle_id: circleId ?? null,
          event_id: eventId ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: fnError } = await supabase.functions.invoke('send-invite', {
        body: { inviteId: data.id },
      });
      if (fnError) throw fnError;

      return data;
    },
    onSuccess: (_data, vars) => {
      if (vars.circleId) {
        qc.invalidateQueries({ queryKey: inviteKeys.forCircle(vars.circleId) });
      }
      if (vars.eventId) {
        qc.invalidateQueries({ queryKey: inviteKeys.forEvent(vars.eventId) });
      }
    },
  });
}

/** Pending invites for a circle (managers only; RLS enforced server-side). */
export function useCircleInvites(circleId: string) {
  return useQuery({
    queryKey: inviteKeys.forCircle(circleId),
    enabled: !!circleId,
    queryFn: async (): Promise<Invite[]> => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('circle_id', circleId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Pending invites for an event (creator only; RLS enforced server-side). */
export function useEventInvites(eventId: string) {
  return useQuery({
    queryKey: inviteKeys.forEvent(eventId),
    enabled: !!eventId,
    queryFn: async (): Promise<Invite[]> => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRevokeInvite(circleId?: string, eventId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (circleId) qc.invalidateQueries({ queryKey: inviteKeys.forCircle(circleId) });
      if (eventId) qc.invalidateQueries({ queryKey: inviteKeys.forEvent(eventId) });
    },
  });
}
