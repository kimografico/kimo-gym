import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Formulario de login
  formData = {
    email: '',
    password: '',
  };

  // Estados del componente
  currentUser: AuthUser | null = null;
  isAuthenticated = false;
  loading = false;
  errorMessage = '';
  showForgotPassword = false;
  resetEmail = '';
  resetMessage = '';

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Suscribirse a cambios en autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          // Redirigir al home si ya está autenticado
          this.router.navigate(['/home']);
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

  // ============= LOGIN CON EMAIL/PASSWORD =============

  async onSubmit() {
    // Resetear mensaje de error
    this.errorMessage = '';

    // Validaciones básicas
    if (!this.validateForm()) return;

    this.loading = true;

    try {
      const result = await this.authService.signIn(
        this.formData.email,
        this.formData.password
      );

      if (result.success) {
        console.log('Login exitoso');
        // La redirección se maneja automáticamente en el subscription
      } else {
        this.errorMessage = result.message;
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = error.message || 'Error en la autenticación';
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.formData.email.trim()) {
      this.errorMessage = 'El email es obligatorio';
      return false;
    }

    if (!this.formData.password) {
      this.errorMessage = 'La contraseña es obligatoria';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Email inválido';
      return false;
    }

    return true;
  }

  // ============= RECUPERACIÓN DE CONTRASEÑA =============

  async sendResetPassword() {
    if (!this.resetEmail.trim()) {
      this.resetMessage = 'Introduce tu email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.resetEmail)) {
      this.resetMessage = 'Email inválido';
      return;
    }

    try {
      const result = await this.authService.resetPassword(this.resetEmail);
      this.resetMessage = result.message;

      if (result.success) {
        // Cerrar el formulario de reset después de 3 segundos
        setTimeout(() => {
          this.showForgotPassword = false;
          this.resetEmail = '';
          this.resetMessage = '';
        }, 3000);
      }
    } catch (error: any) {
      this.resetMessage = error.message || 'Error enviando email';
    }
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.resetMessage = '';
    this.resetEmail = '';
  }

  // ============= NAVEGACIÓN =============

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  // ============= LOGOUT (por si está autenticado) =============

  async logoutUser() {
    try {
      await this.authService.signOut();
      console.log('Usuario desconectado');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  // ============= HELPERS =============

  avatar(filename: string | null): string {
    return filename
      ? this.dataService.getAvatarUrl(filename)
      : '/assets/images/default-avatar.jpg';
  }

  // ============= MÉTODOS LEGACY (para testing) =============

  async testLogin() {
    console.warn('Usando login legacy - considera usar el sistema real');
    await this.loginUserLegacy('47ab8e68-7a3d-42c7-8bec-3c2c94bfaa8a');
  }

  private async loginUserLegacy(userId: string) {
    if (!userId.trim()) return;

    this.loading = true;
    try {
      const success = await this.authService.login(userId);
      if (success) {
        console.log('Usuario autenticado correctamente (legacy)');
        this.router.navigate(['/home']);
      } else {
        console.error('Error en autenticación - usuario no encontrado');
        this.errorMessage = 'Usuario no encontrado';
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.errorMessage = 'Error en la autenticación';
    } finally {
      this.loading = false;
    }
  }
}
