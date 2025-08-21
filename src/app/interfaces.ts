// ============= INTERFACES PRINCIPALES (tablas de la BD) =============

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  difficulty: number; // 1-5
  muscle_group: string;
  equipment: string | null;
  image: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string | null;
  name: string;
  is_public: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string | null;
  date: string;
  created_at: string;
}

// ============= INTERFACES DE TABLAS INTERMEDIAS =============

export interface RoutineExercise {
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
}

export interface SessionExercise {
  session_id: string;
  exercise_id: string;
  reps: number;
}

// ============= INTERFACES PARA CONSULTAS CON RELACIONES =============

export interface RoutineWithExercises extends Routine {
  routine_exercises: {
    sets: number;
    reps: number;
    exercise: Exercise;
  }[];
}

export interface SessionWithExercises extends Session {
  session_exercises: {
    reps: number;
    exercise: Exercise;
  }[];
}

// ============= INTERFACES PARA AUTENTICACIÓN =============

export interface AuthUser extends User {
  avatarUrl?: string;
}
