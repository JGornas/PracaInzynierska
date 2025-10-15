import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from '../../core/services/rest.service';
import { SendingProfileDto, SendingProfilePayload } from './sending-profiles.models';

@Injectable({ providedIn: 'root' })
export class SendingProfilesService {
  constructor(private rest: RestService) {}

  getProfiles(): Observable<SendingProfileDto[]> {
    return this.rest.get<SendingProfileDto[]>('/api/sending-profiles');
  }

  getProfile(id: number): Observable<SendingProfileDto> {
    return this.rest.get<SendingProfileDto>(`/api/sending-profiles/${id}`);
  }

  createProfile(payload: SendingProfilePayload): Observable<SendingProfileDto> {
    return this.rest.post<SendingProfileDto>('/api/sending-profiles', payload);
  }

  updateProfile(id: number, payload: SendingProfilePayload): Observable<SendingProfileDto> {
    return this.rest.put<SendingProfileDto>(`/api/sending-profiles/${id}`, payload);
  }

  deleteProfile(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/sending-profiles/${id}`);
  }
}
