export interface ProfileInterface {
  id: string;
  profileimage: string;
  bio: string;
  username: string;
  email: string;
  role: string | null; // <-- CORRECTED: Allows 'null' as a valid value
  roleVerified: boolean; // <-- CORRECTED: Made a required boolean
}