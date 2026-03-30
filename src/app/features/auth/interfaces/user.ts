export interface User {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  birthDate?: string;
  location?: string;
  profileImageUrl?: string;
  password?: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  role?: 'user' | 'admin';
}
