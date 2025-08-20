import { Injectable } from '@angular/core';
import { supabase, SUPABASE_URL } from './supabase.config';
import { User, Exercise, Routine, Session } from '../interfaces';

type TableKeys = 'Exercise' | 'User' | 'Routine' | 'Session';

const tableMap: Record<TableKeys, string> = {
  Exercise: 'exercises',
  User: 'users',
  Routine: 'routines',
  Session: 'sessions',
};

@Injectable({ providedIn: 'root' })
export class DataService {
  async getAll<K extends TableKeys>(key: K) {
    const tableName = tableMap[key];
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error recuperando ${tableName}:`, error);
      return [];
    }
    return data as unknown as K extends 'Exercise'
      ? Exercise[]
      : K extends 'User'
      ? User[]
      : K extends 'Routine'
      ? Routine[]
      : Session[];
  }

  getAvatarUrl(filename: string): string {
    return `${SUPABASE_URL}/storage/v1/object/public/avatars/${filename}`;
  }
}
