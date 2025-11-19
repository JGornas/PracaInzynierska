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

export class SendingProfile{
  id: number;
  name: string;
  protocol: string;
  senderName: string;
  senderEmail: string;
  host: string;
  port: number;
  username: string;
  useSsl: boolean;
  replyTo: string | null;
  testEmail: string | null;
  hasPassword: boolean;

  constructor() {
    this.id = 0;
    this.name = '';
    this.protocol = '';
    this.senderName = '';
    this.senderEmail = '';
    this.host = '';
    this.port = 0;
    this.username = '';
    this.useSsl = false;
    this.replyTo = null;
    this.testEmail = null;
    this.hasPassword = false;
  }
}

export class Campaign {
  id: number;
  name: string;
  description: string;
  startDateTime: Date | null = null;
  campaignRecipientGroups: RecipientGroup[];
  sendingProfile: SendingProfile | null = null;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.campaignRecipientGroups = [];
  }
}
