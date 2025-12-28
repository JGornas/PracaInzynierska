import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from '../../core/services/rest.service';
import { RecipientDto, RecipientGroupDto, RecipientGroupPayload, RecipientPayload } from './recipients.models';

@Injectable({ providedIn: 'root' })
export class RecipientsService {
  constructor(private rest: RestService) {}

  getRecipients(): Observable<RecipientDto[]> {
    return this.rest.get<RecipientDto[]>('/api/recipients/individuals');
  }

  createRecipient(payload: RecipientPayload): Observable<RecipientDto> {
    return this.rest.post<RecipientDto>('/api/recipients/individuals', payload);
  }

  updateRecipient(id: number, payload: RecipientPayload): Observable<RecipientDto> {
    return this.rest.put<RecipientDto>(`/api/recipients/individuals/${id}`, payload);
  }

  deleteRecipient(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/recipients/individuals/${id}`);
  }

  getGroups(): Observable<RecipientGroupDto[]> {
    return this.rest.get<RecipientGroupDto[]>('/api/recipients/groups');
  }

  createGroup(payload: RecipientGroupPayload): Observable<RecipientGroupDto> {
    return this.rest.post<RecipientGroupDto>('/api/recipients/groups', payload);
  }

  updateGroup(id: number, payload: RecipientGroupPayload): Observable<RecipientGroupDto> {
    return this.rest.put<RecipientGroupDto>(`/api/recipients/groups/${id}`, payload);
  }

  deleteGroup(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/recipients/groups/${id}`);
  }
}
