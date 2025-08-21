import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Exercise, Routine, Session, AuthUser } from '../../interfaces';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
})
export class ExerciseListComponent implements OnInit, OnDestroy {
  // Datos públicos (disponibles para todos)
  exercises: Exercise[] = [];
  publicRoutines: Routine[] = [];

  // Datos del usuario autenticado
  currentUser: AuthUser | null = null;
  userRoutines: Routine[] = [];
  userSessions: Session[] = [];
  isAuthenticated = false;

  // Estados de carga
  loading = {
    exercises: false,
    publicRoutines: false,
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

    // Cargar datos públicos
    await this.loadPublicData();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  // ============= CARGA DE DATOS PÚBLICOS =============

  async loadPublicData() {
    await Promise.all([this.loadExercises(), this.loadPublicRoutines()]);
  }

  async loadExercises() {
    this.loading.exercises = true;
    try {
      this.exercises = await this.dataService.getAllExercises();
      console.log('Ejercicios cargados:', this.exercises.length);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
    } finally {
      this.loading.exercises = false;
    }
  }

  async loadPublicRoutines() {
    this.loading.publicRoutines = true;
    try {
      this.publicRoutines = await this.dataService.getPublicRoutines();
      console.log('Rutinas públicas cargadas:', this.publicRoutines.length);
    } catch (error) {
      console.error('Error cargando rutinas públicas:', error);
    } finally {
      this.loading.publicRoutines = false;
    }
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

  // ============= AUTENTICACIÓN =============

  async loginUser(userId: string) {
    if (!userId.trim()) return;

    this.loading.auth = true;
    try {
      const success = await this.authService.login(userId);
      if (success) {
        console.log('Usuario autenticado correctamente');
      } else {
        console.error('Error en autenticación - usuario no encontrado');
        alert('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('Error en la autenticación');
    } finally {
      this.loading.auth = false;
    }
  }

  logoutUser() {
    this.authService.logout();
    console.log('Usuario desconectado');
  }

  refreshUserData() {
    this.authService.refreshUserData();
    console.log('Usuario refrescado');
  }

  // ============= HELPERS =============

  avatar(filename: string | null): string {
    return filename
      ? this.dataService.getAvatarUrl(filename)
      : '/assets/images/default-avatar.png';
  }

  exerciseImage(filename: string | null): string {
    return filename
      ? this.dataService.getExerciseImageUrl(filename)
      : '/assets/images/default-exercise.png';
  }

  // Obtener datos del usuario rápidamente desde localStorage
  getUserInfo() {
    return this.authService.getUserData();
  }

  // ============= MÉTODOS PARA DEBUGGING =============

  // Para hacer pruebas rápidas con IDs reales de tu BD
  async testLogin() {
    // Cambia este ID por uno real de tu tabla users
    await this.loginUser('id-usuario-real-aqui');
  }

  // Para ver detalles de una rutina pública
  async viewPublicRoutineDetails(routineId: string) {
    try {
      const routine = await this.dataService.getPublicRoutineWithExercises(
        routineId
      );
      console.log('Rutina pública con ejercicios:', routine);
    } catch (error) {
      console.error('Error:', error);
    }
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
