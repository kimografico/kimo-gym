import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
    this.loadUserFromStorage();
  }

  // ============= GESTIÓN DEL LOCALSTORAGE =============

  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (userData) {
        const user: AuthUser = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
      }
    } catch (error) {
      console.error('Error cargando usuario desde localStorage:', error);
      this.clearUserStorage();
    }
  }

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

  // ============= AUTENTICACIÓN =============

  async login(userId: string): Promise<boolean> {
    try {
      const userData = await this.dataService.getUserById(userId);

      if (!userData) {
        console.error('Usuario no encontrado');
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
      console.error('Error en login:', error);
      return false;
    }
  }

  logout(): void {
    this.clearUserStorage();
  }

  // ============= GETTERS =============

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

  // ============= ACTUALIZACIÓN =============

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
}
