
export interface User {
  email: string;
  name?: string;
  preferences?: string[]; // List of favorite categories
}

export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  venue?: string;
  city: string;
  category: EventCategory;
  imageUrl: string;
  price?: string;
  organizer?: string;
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

export interface SearchState {
  query: string;
  city: string;
  category: EventCategory | 'Alle';
}

export interface GroundingSource {
  title: string;
  uri: string;
}
