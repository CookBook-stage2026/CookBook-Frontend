import { User } from '@shared/domain/user';

export interface CreateHouseholdRequest {
  name: string;
  description: string;
}

export interface Household {
  id: string;
  name: string;
  description: string;
  members: User[];
  creator: User;
}
