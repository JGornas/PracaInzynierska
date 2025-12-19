import { LandingPage } from "../landing-pages/landing-pages.models";
import { SendingProfile } from "../sending-profiles/sending-profiles.models";
import { Template } from "../templates/templates.models";

export class RecipientGroup {
  id: number;
  name: string;
  campaign?: string | null;
  createdAt?: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.campaign = null;
    this.createdAt = undefined;
  }
}

export class CampaignRecipient {
  firstName: string;
  constructor(firstName: string = '') {
    this.firstName = firstName;
  }
}

export class Campaign {
  id: number;
  name: string;
  description: string;
  sendTime: string | null = null;
  isSentSuccessfully: boolean = false;
  campaignRecipientGroups: RecipientGroup[];
  sendingProfile: SendingProfile | null = null;
  template: Template | null = null;
  landingPage: LandingPage | null = null;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.campaignRecipientGroups = [];
  }

  get campaignRecipientGroupIds(): number[] {
    return this.campaignRecipientGroups.map(g => g.id);
  }
}
