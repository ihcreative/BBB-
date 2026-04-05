export type Tag = 'design' | 'development' | 'marketing' | 'finance' | 'legal' | 'wellness' | 'education' | 'events' | 'content' | 'consulting';

export interface Member {
  id: string;
  name: string;
  photo: string;
  businessName: string;
  description: string;
  offers: Tag[];
  needs: Tag[];
  perks: Perk[];
  collaborationHours: '1-2' | '3-5' | '5+';
  isApproved: boolean;
  publicVisibility: boolean;
  role: 'member' | 'admin';
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt?: any;
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  value: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  area: string;
  location?: string;
  description: string;
}
