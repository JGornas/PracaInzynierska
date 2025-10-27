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
