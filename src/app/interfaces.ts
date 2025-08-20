export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  muscle_group: string;
  equipment: string;
  image: string;
  created_at: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  routine_id: string;
  date: string;
  performed_at: string;
}
