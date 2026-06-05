import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Circle = Database['public']['Tables']['circles']['Row'];

export const circleKeys = {
  all: ['circles'] as const,
  detail: (id: string) => ['circles', id] as const,
  members: (id: string) => ['circles', id, 'members'] as const,
};

/** Circles the current user belongs to (RLS scopes this to memberships). */
export function useCircles() {
  return useQuery({
    queryKey: circleKeys.all,
    queryFn: async (): Promise<Circle[]> => {
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCircle(id: string) {
  return useQuery({
    queryKey: circleKeys.detail(id),
    enabled: !!id,
    queryFn: async (): Promise<Circle> => {
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export interface CircleMemberWithProfile {
  id: string;
  role: Database['public']['Tables']['circle_members']['Row']['role'];
  user_id: string;
  profile: { username: string; display_name: string | null } | null;
}

export function useCircleMembers(circleId: string) {
  return useQuery({
    queryKey: circleKeys.members(circleId),
    enabled: !!circleId,
    queryFn: async (): Promise<CircleMemberWithProfile[]> => {
      const { data, error } = await supabase
        .from('circle_members')
        .select('id, role, user_id, profile:profiles(username, display_name)')
        .eq('circle_id', circleId)
        .order('joined_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CircleMemberWithProfile[];
    },
  });
}

export function useCreateCircle() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      activity_tags?: string[];
    }): Promise<Circle> => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('circles')
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: circleKeys.all }),
  });
}

/** Add a member by their username (manager-only, enforced by RLS). */
export function useAddMemberByUsername(circleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
      if (pErr) throw new Error(`No user found with username "${username}"`);
      const { error } = await supabase
        .from('circle_members')
        .insert({ circle_id: circleId, user_id: profile.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: circleKeys.members(circleId) }),
  });
}
