export type UserProfile = {
  age: string;
  created_at?: string;
  email: string;
  gender: string;
  id: string;
  name: string;
};

export type AuthSession = {
  token: string;
  user: UserProfile;
};
