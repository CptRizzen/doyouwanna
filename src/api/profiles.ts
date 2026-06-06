import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ProfileUpdate {
  display_name?: string | null;
  bio?: string | null;
  location_label?: string | null;
  interests?: string[];
  activity_tags?: string[];
  discovery_mode?: Profile['discovery_mode'];
}

export const profileKeys = {
  me: (uid: string) => ['profiles', uid] as const,
};

/** The signed-in user's own profile. */
export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKeys.me(user?.id ?? 'anon'),
    enabled: !!user,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (update: ProfileUpdate): Promise<Profile> => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: profileKeys.me(user.id) });
    },
  });
}
