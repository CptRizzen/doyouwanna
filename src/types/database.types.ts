/**
 * Database types for the DoYouWanna Supabase schema.
 *
 * Hand-authored to match supabase/migrations. Regenerate against a real project
 * with: `npm run supabase:gen-types` (requires `supabase start` / a linked
 * project).
 *
 * PostGIS `geography(Point)` columns are returned by PostgREST as GeoJSON
 * strings; we model them as `string | null` and parse at the edge.
 */

export type DiscoveryMode = 'off' | 'activity_match' | 'open';
export type CircleRole = 'owner' | 'admin' | 'member';
export type EventVisibility = 'circles_only' | 'discoverable';
export type RsvpStatus =
  | 'invited'
  | 'going'
  | 'maybe'
  | 'not_going'
  | 'on_my_way'
  | 'arrived';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type ConnectionStatus = 'pending' | 'connected' | 'blocked';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          activity_tags: string[];
          discovery_mode: DiscoveryMode;
          home_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          activity_tags?: string[];
          discovery_mode?: DiscoveryMode;
          home_location?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      circles: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          activity_tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          activity_tags?: string[];
        };
        Update: Partial<Database['public']['Tables']['circles']['Insert']>;
        Relationships: [];
      };
      circle_members: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string;
          role: CircleRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          user_id: string;
          role?: CircleRole;
        };
        Update: Partial<Database['public']['Tables']['circle_members']['Insert']>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          activity_tags: string[];
          visibility: EventVisibility;
          location: string | null;
          place_name: string | null;
          starts_at: string | null;
          ends_at: string | null;
          is_checkin: boolean;
          discovery_radius_m: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string | null;
          activity_tags?: string[];
          visibility?: EventVisibility;
          location?: string | null;
          place_name?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_checkin?: boolean;
          discovery_radius_m?: number | null;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
        Relationships: [];
      };
      event_circles: {
        Row: { event_id: string; circle_id: string };
        Insert: { event_id: string; circle_id: string };
        Update: Partial<{ event_id: string; circle_id: string }>;
        Relationships: [];
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          rsvp_status: RsvpStatus;
          visible_to_strangers: boolean;
          live_location: string | null;
          live_location_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          rsvp_status?: RsvpStatus;
          visible_to_strangers?: boolean;
          live_location?: string | null;
          live_location_updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['event_attendees']['Insert']>;
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          event_id: string | null;
          circle_id: string | null;
          inviter_id: string;
          email: string;
          token: string;
          status: InviteStatus;
          accepted_by: string | null;
          expires_at: string;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          circle_id?: string | null;
          inviter_id: string;
          email: string;
          token?: string;
          status?: InviteStatus;
          expires_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invites']['Insert']>;
        Relationships: [];
      };
      discovery_connections: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          status: ConnectionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          status?: ConnectionStatus;
        };
        Update: Partial<
          Database['public']['Tables']['discovery_connections']['Insert']
        >;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_event_id: string | null;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_event_id?: string | null;
          reason: string;
          details?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      discoverable_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          activity_tags: string[];
          discovery_mode: DiscoveryMode;
          approx_location: string | null;
        };
        Relationships: [];
      };
      visible_attendee_locations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          rsvp_status: RsvpStatus;
          live_location_updated_at: string | null;
          live_location: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_invite: {
        Args: { p_token: string };
        Returns: Database['public']['Tables']['invites']['Row'];
      };
    };
    Enums: Record<string, never>;
  };
}
