import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase.config';
import { AuthUser } from '../interfaces';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_STORAGE_KEY = 'gym_app_user';

  // Observables para reactive programming
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(private dataService: DataService) {
    this.initializeAuth();
  }

  // ============= INICIALIZACIÓN =============

  private async initializeAuth() {
    // Verificar si hay una sesión activa
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await this.handleAuthUser(session.user);
    }

    // Escuchar cambios en el estado de autenticación
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      if (session?.user) {
        await this.handleAuthUser(session.user);
      } else {
        this.clearUserStorage();
      }
    });
  }

  private async handleAuthUser(authUser: any) {
    try {
      // Obtener datos del usuario desde public.users
      const userData = await this.dataService.getUserById(authUser.id);

      if (userData) {
        const completeUser: AuthUser = {
          ...userData,
          avatarUrl: userData.avatar
            ? this.dataService.getAvatarUrl(userData.avatar)
            : undefined,
        };

        this.saveUserToStorage(completeUser);
        this.currentUserSubject.next(completeUser);
        this.isAuthenticated$.next(true);
      }
    } catch (error) {
      console.error('Error manejando usuario autenticado:', error);
    }
  }

  // ============= GESTIÓN DEL LOCALSTORAGE =============

  private saveUserToStorage(user: AuthUser): void {
    try {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando usuario en localStorage:', error);
    }
  }

  private clearUserStorage(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
  }

  // ============= REGISTRO =============

  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Error creando usuario' };
      }

      // 2. Crear registro en public.users
      const userRecord = await this.dataService.createUser({
        id: data.user.id, // Usar el mismo UUID de Supabase Auth
        name,
        avatar: null,
      });

      if (!userRecord) {
        // Si falla la creación en public.users, deberíamos limpiar el usuario de Auth
        // pero por simplicidad lo dejamos así por ahora
        return { success: false, message: 'Error creando perfil de usuario' };
      }

      return {
        success: true,
        message: data.user.email_confirmed_at
          ? 'Usuario creado correctamente'
          : 'Usuario creado. Revisa tu email para confirmar la cuenta.',
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error en el registro',
      };
    }
  }

  // ============= LOGIN =============

  async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Error en la autenticación' };
      }

      // El manejo del usuario se hace automáticamente en onAuthStateChange
      return { success: true, message: 'Login exitoso' };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, message: error.message || 'Error en el login' };
    }
  }

  // ============= LOGOUT =============

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error en logout:', error);
      }
      // La limpieza se hace automáticamente en onAuthStateChange
    } catch (error) {
      console.error('Error en signOut:', error);
    }
  }

  // ============= RECUPERACIÓN DE CONTRASEÑA =============

  async resetPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Email de recuperación enviado' };
    } catch (error: any) {
      console.error('Error en reset password:', error);
      return {
        success: false,
        message: error.message || 'Error enviando email',
      };
    }
  }

  // ============= MÉTODOS DE UTILIDAD =============

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }

  getUserData(): {
    id: string;
    name: string;
    avatar?: string;
    avatarUrl?: string;
  } | null {
    const user = this.getCurrentUser();
    return user
      ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar || undefined,
          avatarUrl: user.avatarUrl,
        }
      : null;
  }

  async refreshUserData(): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    try {
      const updatedUserData = await this.dataService.getUserById(
        currentUser.id
      );
      if (updatedUserData) {
        const updatedAuthUser: AuthUser = {
          ...updatedUserData,
          avatarUrl: updatedUserData.avatar
            ? this.dataService.getAvatarUrl(updatedUserData.avatar)
            : undefined,
        };

        this.saveUserToStorage(updatedAuthUser);
        this.currentUserSubject.next(updatedAuthUser);
      }
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
    }
  }

  // ============= MÉTODOS LEGACY (para compatibilidad) =============

  async login(userId: string): Promise<boolean> {
    console.warn('Método login() legacy - usar signIn() con email/password');
    try {
      const userData = await this.dataService.getUserById(userId);

      if (!userData) {
        return false;
      }

      const authUser: AuthUser = {
        ...userData,
        avatarUrl: userData.avatar
          ? this.dataService.getAvatarUrl(userData.avatar)
          : undefined,
      };

      this.saveUserToStorage(authUser);
      this.currentUserSubject.next(authUser);
      this.isAuthenticated$.next(true);

      return true;
    } catch (error) {
      console.error('Error en login legacy:', error);
      return false;
    }
  }

  logout(): void {
    console.warn('Método logout() legacy - usar signOut()');
    this.signOut();
  }
}
