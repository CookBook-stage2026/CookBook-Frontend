export interface HouseholdInvite {
  id: string;
  token: string;
  expiresAt: string | null;
}

export interface HouseholdInviteDto {
  householdInviteId: string;
  revoked: boolean;
}

export interface CreateHouseholdInviteRequest {
  durationMinutes?: number | null;
}
