/* Prototype seed users. Not for production use. */
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Plaintext for local prototype demonstration only
  role: string;
  photo?: string | null;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_default_01',
    name: 'Irfan Satya',
    email: 'irfan@gmail.com',
    phone: '+62 812-3456-7890',
    password: 'Password#2026',
    role: 'Pengguna NutrimateAI',
    photo: null,
  },
  {
    id: 'usr_bunda_sari',
    name: 'Sari Rahayu',
    email: 'sari@nutrimateai.id',
    phone: '+62 813-9876-5432',
    password: 'Password#2026',
    role: 'Pengguna NutrimateAI',
    photo: null,
  },
];
