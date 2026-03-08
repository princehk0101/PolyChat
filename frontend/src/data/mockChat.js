export const mockCurrentUser = {
  uid: 'self-001',
  username: 'alex.manager',
  displayName: 'Alex Morgan',
  nativeLanguage: 'en',
  region: 'North America',
};

export const mockUsers = [
  {
    uid: 'usr-001',
    username: 'anita.ops',
    displayName: 'Anita Sharma',
    nativeLanguage: 'hi',
    region: 'Asia',
    role: 'Operations Lead',
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80',
  },
  {
    uid: 'usr-002',
    username: 'carlos.design',
    displayName: 'Carlos Mendes',
    nativeLanguage: 'pt',
    region: 'South America',
    role: 'Product Designer',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    uid: 'usr-003',
    username: 'sophia.pm',
    displayName: 'Sophia Miller',
    nativeLanguage: 'de',
    region: 'Europe',
    role: 'Project Manager',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
  },
  {
    uid: 'usr-004',
    username: 'kenji.dev',
    displayName: 'Kenji Tanaka',
    nativeLanguage: 'ja',
    region: 'Asia',
    role: 'Frontend Engineer',
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=240&q=80',
  },
];

const now = Date.now();

const minutesAgo = (value) => new Date(now - value * 60 * 1000);

export const mockMessagesByUser = {
  'usr-001': [
    {
      id: 'm-1',
      senderID: 'usr-001',
      content: 'Can we move the release to Tuesday to align with APAC handoff?',
      translatedContent: 'Kya hum release ko Tuesday tak shift kar sakte hain?',
      nuance:
        'Nuance alert: "move the release" can sound urgent. Consider adding context for flexibility.',
      timestamp: minutesAgo(35),
    },
    {
      id: 'm-2',
      senderID: 'self-001',
      content: 'Yes, that works. I will update the timeline and notify everyone.',
      translatedContent: 'Haan, ye theek hai. Main timeline update karke sabko bata dunga.',
      nuance: null,
      timestamp: minutesAgo(31),
    },
  ],
  'usr-002': [
    {
      id: 'm-3',
      senderID: 'usr-002',
      content: 'I shared a new homepage prototype with softer onboarding flow.',
      translatedContent: 'Compartilhei um novo prototipo da homepage com onboarding mais suave.',
      nuance: null,
      timestamp: minutesAgo(18),
    },
  ],
  'usr-003': [
    {
      id: 'm-4',
      senderID: 'self-001',
      content: 'Please review scope notes before stand-up.',
      translatedContent: 'Bitte prufe die Scope-Notizen vor dem Stand-up.',
      nuance:
        'Nuance alert: Imperative phrasing may feel strict. Suggested: "Could you review..."',
      timestamp: minutesAgo(10),
    },
  ],
  'usr-004': [],
};
