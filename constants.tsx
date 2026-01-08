
import React from 'react';

export const CITIES = [
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø', 'Bodø', 'Ålesund', 'Drammen'
];

export const CATEGORIES = [
  'Konsert', 'Teater', 'Festival', 'Kunst', 'Standup', 'Sport'
];

export const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Aurora - What Happened to the Heart? Tour',
    description: 'Opplev den magiske Aurora live i Bergen. En kveld med drømmende pop og sterke følelser.',
    date: '2025-05-15',
    location: 'Grieghallen',
    city: 'Bergen',
    category: 'Konsert',
    imageUrl: 'https://picsum.photos/seed/aurora/800/600',
    tags: ['Pop', 'Magisk', 'Norsk'],
    price: 'fra 550,-'
  },
  {
    id: '2',
    title: 'Peer Gynt - Nationaltheatret',
    description: 'En moderne tolkning av Ibsens klassiker. En reise gjennom menneskets sjel.',
    date: '2025-04-20',
    location: 'Nationaltheatret',
    city: 'Oslo',
    category: 'Teater',
    imageUrl: 'https://picsum.photos/seed/theater/800/600',
    tags: ['Klassisk', 'Drama', 'Kultur'],
    price: '350 - 800,-'
  },
  {
    id: '3',
    title: 'Oslo Jazz Festival 2025',
    description: 'Uken fylt med det beste fra den internasjonale og nasjonale jazzscenen.',
    date: '2025-08-12',
    location: 'Ulike steder',
    city: 'Oslo',
    category: 'Festival',
    imageUrl: 'https://picsum.photos/seed/jazz/800/600',
    tags: ['Jazz', 'Sommer', 'Urban'],
    price: 'Festivalpass 1800,-'
  },
  {
    id: '4',
    title: 'Dag Sørås - Apokalypsen Nå',
    description: 'Mørk og treffende humor fra en av Norges mest profilerte komikere.',
    date: '2025-03-05',
    location: 'Olavshallen',
    city: 'Trondheim',
    category: 'Standup',
    imageUrl: 'https://picsum.photos/seed/comedy/800/600',
    tags: ['Mørk humor', 'Samfunnskritikk'],
    price: '420,-'
  },
  {
    id: '5',
    title: 'Edvard Munch - Det moderne øye',
    description: 'En omfattende utstilling av Munchs senere verker.',
    date: '2025-02-10',
    location: 'MUNCH',
    city: 'Oslo',
    category: 'Kunst',
    imageUrl: 'https://picsum.photos/seed/munch/800/600',
    tags: ['Utstilling', 'Historie'],
    price: '160,-'
  },
  {
    id: '6',
    title: 'Karpe - Omar Sheriff Tour',
    description: 'Den legendariske duoen inntar Stavanger for et spektakulært show.',
    date: '2025-06-30',
    location: 'DNB Arena',
    city: 'Stavanger',
    category: 'Konsert',
    imageUrl: 'https://picsum.photos/seed/karpe/800/600',
    tags: ['Hip hop', 'Show', 'Energi'],
    price: 'fra 690,-'
  }
];
