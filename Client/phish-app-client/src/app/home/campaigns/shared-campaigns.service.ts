import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Campaign } from './campaigns.models';
import { CampaignsService } from './campaigns.service';

@Injectable({ providedIn: 'root' })
export class SharedCampaignService {
  private currentSubject = new BehaviorSubject<Campaign | null>(null);
  public current$ = this.currentSubject.asObservable();

  setCurrent(campaign: Campaign | null): void {
    this.currentSubject.next(campaign);
  }

  getCurrentValue(): Campaign | null {
    return this.currentSubject.getValue();
  }

  clear(): void {
    this.currentSubject.next(null);
  }
}
