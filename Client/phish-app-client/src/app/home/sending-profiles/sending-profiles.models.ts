export interface SendingProfileDto {
  id: number;
  name: string;
  protocol: string;
  senderName: string;
  senderEmail: string;
  host: string;
  port: number;
  username: string;
  useSsl: boolean;
  replyTo?: string | null;
  hasPassword: boolean;
  testEmail: string | null;
}

export interface SendingProfilePayload {
  name: string;
  protocol: string;
  senderName: string;
  senderEmail: string;
  host: string;
  port: number;
  username: string;
  password?: string | null;
  useSsl: boolean;
  replyTo?: string | null;
  testEmail?: string | null;
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