export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}
