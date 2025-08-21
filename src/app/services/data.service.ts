import { Injectable } from '@angular/core';
import { supabase, SUPABASE_URL } from './supabase.config';
import {
  User,
  Exercise,
  Routine,
  Session,
  RoutineWithExercises,
  SessionWithExercises,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class DataService {
  // ============= EXERCISES =============

  async getAllExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) {
      console.error('Error recuperando ejercicios:', error);
      return [];
    }
    return data || [];
  }

  // ============= RUTINAS PÚBLICAS =============

  async getPublicRoutines(): Promise<Routine[]> {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error recuperando rutinas públicas:', error);
      return [];
    }
    return data || [];
  }

  async getPublicRoutineWithExercises(
    routineId: string
  ): Promise<RoutineWithExercises | null> {
    const { data, error } = await supabase
      .from('routines')
      .select(
        `
        *,
        routine_exercises (
          sets,
          reps,
          exercise:exercises (*)
        )
      `
      )
      .eq('id', routineId)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('Error recuperando rutina pública con ejercicios:', error);
      return null;
    }
    return data as RoutineWithExercises;
  }

  // ============= RUTINAS DEL USUARIO =============

  async getUserRoutines(userId: string): Promise<Routine[]> {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error recuperando rutinas del usuario:', error);
      return [];
    }
    return data || [];
  }

  async getUserRoutineWithExercises(
    routineId: string,
    userId: string
  ): Promise<RoutineWithExercises | null> {
    const { data, error } = await supabase
      .from('routines')
      .select(
        `
        *,
        routine_exercises (
          sets,
          reps,
          exercise:exercises (*)
        )
      `
      )
      .eq('id', routineId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(
        'Error recuperando rutina del usuario con ejercicios:',
        error
      );
      return null;
    }
    return data as RoutineWithExercises;
  }

  // ============= SESIONES DEL USUARIO =============

  async getUserSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error recuperando sesiones del usuario:', error);
      return [];
    }
    return data || [];
  }

  async getUserSessionWithExercises(
    sessionId: string,
    userId: string
  ): Promise<SessionWithExercises | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        session_exercises (
          reps,
          exercise:exercises (*)
        )
      `
      )
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(
        'Error recuperando sesión del usuario con ejercicios:',
        error
      );
      return null;
    }
    return data as SessionWithExercises;
  }

  // ============= USUARIO =============

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error recuperando usuario:', error);
      return null;
    }
    return data;
  }

  async createUser(user: {
    id: string;
    name: string;
    avatar: string | null;
  }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      return null;
    }
    return data;
  }

  // ============= URLS DE ARCHIVOS =============

  getAvatarUrl(filename: string): string {
    return `${SUPABASE_URL}/storage/v1/object/public/avatars/${filename}`;
  }

  getExerciseImageUrl(filename: string): string {
    return `${SUPABASE_URL}/storage/v1/object/public/exercises/${filename}`;
  }
}
