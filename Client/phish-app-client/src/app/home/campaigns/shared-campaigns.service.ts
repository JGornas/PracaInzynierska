import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Campaign } from './campaigns.models';
import { CampaignsService } from './campaigns.service';

@Injectable({ providedIn: 'root' })
export class SharedCampaignService {
  private currentSubject = new BehaviorSubject<Campaign | null>(null);
  public current$: Observable<Campaign | null> = this.currentSubject.asObservable();

  constructor(private campaignsService: CampaignsService) {}

  getCurrentValue(): Campaign | null {
    return this.currentSubject.getValue();
  }

  setCurrent(campaign: Campaign | null): void {
    this.currentSubject.next(campaign);
  }

  clear(): void {
    this.currentSubject.next(null);
  }

  async loadById(id: number): Promise<Campaign> {
    const campaign = await firstValueFrom(this.campaignsService.getCampaign(id));
    this.currentSubject.next(campaign);
    return campaign;
  }

  async saveCurrent(): Promise<Campaign> {
    const current = this.getCurrentValue();
    if (!current) throw new Error('No current campaign set');
    const updated = await firstValueFrom(this.campaignsService.updateCampaign(current.id, current));
    this.currentSubject.next(updated);
    return updated;
  }

  async reloadCurrent(): Promise<Campaign | null> {
    const cur = this.getCurrentValue();
    if (!cur) return null;
    return this.loadById(cur.id);
  }
}