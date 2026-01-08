export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  venue?: string;
  city: string;
  category: string;
  imageUrl: string;
  price?: string;
  tags: string[];
  link?: string;
}

export enum EventCategory {
  CONCERT = 'Konsert',
  THEATER = 'Teater',
  FESTIVAL = 'Festival',
  ART = 'Kunst',
  COMEDY = 'Standup',
  SPORTS = 'Sport',
  OTHER = 'Annet'
}

export interface User {
  email: string;
  name?: string;
  preferences?: string[];
}