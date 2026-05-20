import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateHouseholdInviteRequest, HouseholdInvite, HouseholdInviteDto, } from '@shared/domain/household-invite';

@Injectable({ providedIn: 'root' })
export class HouseholdInviteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/household-invites';

  getInvite(inviteId: string): Observable<HouseholdInviteDto> {
    return this.http.get<HouseholdInviteDto>(`${this.apiUrl}/${inviteId}`);
  }

  createInvite(
    householdId: string,
    request: CreateHouseholdInviteRequest = {},
  ): Observable<HouseholdInvite> {
    return this.http.post<HouseholdInvite>(
      `${this.apiUrl}/${householdId}/invites`,
      request,
    );
  }

  acceptInvite(token: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/invites/${token}/accept`,
      {},
    );
  }

  revokeInvite(householdId: string, inviteId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${householdId}/invites/${inviteId}`,
    );
  }
}
