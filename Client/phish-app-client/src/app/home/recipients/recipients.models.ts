export interface RecipientDto {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  externalId?: string | null;
  createdAt?: string | null;
}

export interface RecipientPayload {
  id?: number | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  externalId?: string | null;
}

export interface RecipientGroupDto {
  id: number;
  name: string;
  campaign?: string | null;
  createdAt?: string | null;
  members: RecipientDto[];
}

export interface RecipientGroupPayload {
  name: string;
  campaign?: string | null;
  members: RecipientPayload[];
}
