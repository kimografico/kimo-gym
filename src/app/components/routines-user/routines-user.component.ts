import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Routine, Session, AuthUser } from '../../interfaces';

@Component({
  selector: 'app-routines-user',
  templateUrl: './routines-user.component.html',
  styleUrls: ['./routines-user.component.scss'],
})
export class RoutinesUserComponent implements OnInit, OnDestroy {
  // Datos del usuario autenticado
  currentUser: AuthUser | null = null;
  userRoutines: Routine[] = [];
  userSessions: Session[] = [];
  isAuthenticated = false;

  // Estados de carga
  loading = {
    userRoutines: false,
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

    await Promise.all([
      this.loadUserRoutines(userId),
      this.loadUserSessions(userId),
    ]);
  }

  async loadUserRoutines(userId: string) {
    this.loading.userRoutines = true;
    try {
      this.userRoutines = await this.dataService.getUserRoutines(userId);
      console.log('Rutinas del usuario cargadas:', this.userRoutines.length);
    } catch (error) {
      console.error('Error cargando rutinas del usuario:', error);
    } finally {
      this.loading.userRoutines = false;
    }
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
    this.userRoutines = [];
    this.userSessions = [];
  }

  // Obtener datos del usuario rápidamente desde localStorage
  getUserInfo() {
    return this.authService.getUserData();
  }

  // Para ver detalles de rutina del usuario
  async viewUserRoutineDetails(routineId: string) {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    try {
      const routine = await this.dataService.getUserRoutineWithExercises(
        routineId,
        userId
      );
      console.log('Rutina del usuario con ejercicios:', routine);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
