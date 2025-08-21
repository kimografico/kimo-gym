import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Session, AuthUser } from '../../interfaces';

@Component({
  selector: 'app-sessions-user',
  templateUrl: './sessions-user.component.html',
  styleUrls: ['./sessions-user.component.scss'],
})
export class SessionsUserComponent implements OnInit, OnDestroy {
  // Datos del usuario autenticado
  currentUser: AuthUser | null = null;
  userSessions: Session[] = [];
  isAuthenticated = false;

  // Estados de carga
  loading = {
    userSessions: false,
    auth: false,
  };

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Suscribirse a cambios en autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadUserData();
        } else {
          this.clearUserData();
        }
      }
    );

    // Suscribirse a cambios en datos del usuario
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  // ============= CARGA DE DATOS DEL USUARIO =============

  async loadUserData() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    await Promise.all([this.loadUserSessions(userId)]);
  }

  async loadUserSessions(userId: string) {
    this.loading.userSessions = true;
    try {
      this.userSessions = await this.dataService.getUserSessions(userId);
      console.log('Sesiones del usuario cargadas:', this.userSessions.length);
    } catch (error) {
      console.error('Error cargando sesiones del usuario:', error);
    } finally {
      this.loading.userSessions = false;
    }
  }

  private clearUserData() {
    this.userSessions = [];
  }

  // Obtener datos del usuario rápidamente desde localStorage
  getUserInfo() {
    return this.authService.getUserData();
  }

  // Para ver detalles de sesión del usuario
  async viewUserSessionDetails(sessionId: string) {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    try {
      const session = await this.dataService.getUserSessionWithExercises(
        sessionId,
        userId
      );
      console.log('Sesión del usuario con ejercicios:', session);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
