import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateHouseholdRequest, Household } from '@shared/domain/household';

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/households';

  createHousehold(request: CreateHouseholdRequest): Observable<Household> {
    return this.http.post<Household>(this.apiUrl, request);
  }

  getHouseholds(): Observable<Household[]> {
    return this.http.get<Household[]>(this.apiUrl);
  }

  getHouseholdById(id: string): Observable<Household> {
    return this.http.get<Household>(`${this.apiUrl}/${id}`);
  }

  removeMember(householdId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${householdId}/members/${userId}`,);
  }

  deleteHousehold(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
