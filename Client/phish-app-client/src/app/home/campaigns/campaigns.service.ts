import { Injectable } from '@angular/core';
import { RestService } from '../../core/services/rest.service';
import { Campaign, RecipientGroup, SendingProfile } from './campaigns.models';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LandingPage } from '../landing-pages/landing-pages.models';
import { Template } from '../templates/templates.models';

@Injectable({
  providedIn: 'root'
})
export class CampaignsService {
  constructor(private rest: RestService) {}


  public getCampaign(id: number): Observable<Campaign> {
    return this.rest.get<any>(`/api/campaigns/${id}`).pipe(
      map(response => this.mapToCampaign(response)),
      catchError(err => {
        console.error(`Błąd pobierania kampanii id=${id}`, err);
        return throwError(() => err);
      })
    );
  }


  public updateCampaign( payload: Partial<Campaign>): Observable<Campaign> {
    return this.rest.post<any>(`/api/campaigns/update`, payload).pipe(
      map(response => this.mapToCampaign(response)),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  public deleteCampaign(id: number): Observable<void> {
    return this.rest.delete<void>(`/api/campaigns/${id}`).pipe(
      catchError(err => {
        console.error(`Błąd usuwania kampanii id=${id}`, err);
        return throwError(() => err);
      })
    );
  }

  private mapToCampaign(input: any): Campaign {
    const c = new Campaign();
    if (!input) return c;

    const src = input.data ?? input;

    c.id = Number(src.id) || 0;
    c.name = src.name ?? '';
    c.description = src.description ?? '';

    if (src.sendTime) {
      const dt = new Date(src.sendTime);
      c.sendTime = isNaN(dt.getTime()) ? null : dt;
    } else {
      c.sendTime = null;
    }

    if (src.sendingProfile) {
      const spSrc = src.sendingProfile;
      const sp = new SendingProfile();
      sp.id = Number(spSrc.id) || 0;
      sp.name = spSrc.name ?? '';
      sp.protocol = spSrc.protocol ?? '';
      sp.senderName = spSrc.senderName ?? '';
      sp.senderEmail = spSrc.senderEmail ?? '';
      sp.host = spSrc.host ?? '';
      sp.port = Number(spSrc.port) || 0;
      sp.username = spSrc.username ?? '';
      sp.useSsl = !!spSrc.useSsl;
      sp.replyTo = spSrc.replyTo ?? null;
      sp.testEmail = spSrc.testEmail ?? null;
      sp.hasPassword = !!spSrc.hasPassword;
      c.sendingProfile = sp;
    } else {
      c.sendingProfile = null;
    }

    if (src.template) {
      const tSrc = src.template;
      const t = new Template();
      t.id = Number(tSrc.id) || 0;
      t.name = tSrc.name ?? '';
      t.subject = tSrc.subject ?? '';
      t.content = tSrc.content ?? '';
      t.designObject = tSrc.designObject ?? null;
      c.template = t;
    } else {
      c.template = null;
    }

    if (src.landingPage) {
      const lpSrc = src.landingPage;
      const lp = new LandingPage();
      lp.id = Number(lpSrc.id) || 0;
      lp.name = lpSrc.name ?? '';
      lp.content = lpSrc.content ?? '';
      c.landingPage = lp;
    } else {
      c.landingPage = null;
    }

    if (Array.isArray(src.campaignRecipientGroups)) {
      c.campaignRecipientGroups = src.campaignRecipientGroups.map((g: any) => {
        const rg = new RecipientGroup();
        rg.id = Number(g.id) || 0;
        rg.name = g.name ?? '';
        rg.campaign = g.campaign ?? null;
        rg.createdAt = g.createdAt ?? undefined;

        if (Array.isArray((g as any).members)) {
          (rg as any).members = (g as any).members.map((m: any) => ({
            id: Number(m.id) || 0,
            email: m.email ?? '',
            firstName: m.firstName ?? '',
            lastName: m.lastName ?? '',
            position: m.position ?? '',
            externalId: m.externalId ?? '',
            createdAt: m.createdAt ?? null
          }));
        }

        return rg;
      });
    } else {
      c.campaignRecipientGroups = [];
    }

    return c;
  }

}