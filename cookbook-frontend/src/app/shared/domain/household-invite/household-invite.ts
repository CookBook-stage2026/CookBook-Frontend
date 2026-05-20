export interface HouseholdInvite {
  id: string;
  token: string;
  expiresAt: string | null;
}

export interface CreateHouseholdInviteRequest {
  durationMinutes?: number | null;
}
