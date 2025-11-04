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

export class Campaign {
  id: number;
  name: string;
  description: string;
  campaignRecipientGroups: RecipientGroup[];

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.campaignRecipientGroups = [];
  }
}
