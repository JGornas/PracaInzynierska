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
      console.log('Ustawiam current:', campaign);
      this.currentSubject.next(campaign);
  }

  getCurrentValue(): Campaign | null {
      const value = this.currentSubject.getValue();
      console.log('Pobieram current:', value);
      return value;
  }


  clear(): void {
    this.currentSubject.next(null);
  }
}
