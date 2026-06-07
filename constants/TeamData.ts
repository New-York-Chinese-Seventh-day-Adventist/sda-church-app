export interface TeamMember {
  name: string;
  roleKey: 'seniorPastor' | 'bibleWorker' | 'childrensMinistry';
  phone?: string;
  email?: string;
  initials: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'TBD',
    roleKey: 'seniorPastor',
    initials: 'SP',
  },
  {
    name: 'TBD',
    roleKey: 'bibleWorker',
    initials: 'BW',
  },
  {
    name: 'TBD',
    roleKey: 'childrensMinistry',
    initials: 'CM',
  },
];
