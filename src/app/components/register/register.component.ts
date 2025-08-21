import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.validateForm()) return;

    this.loading = true;

    try {
      const result = await this.authService.signUp(
        this.formData.email,
        this.formData.password,
        this.formData.name
      );

      if (result.success) {
        this.successMessage = result.message;
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage = result.message;
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en el registro';
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    // Validar nombre
    if (!this.formData.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return false;
    }

    if (this.formData.name.trim().length < 2) {
      this.errorMessage = 'El nombre debe tener al menos 2 caracteres';
      return false;
    }

    // Validar email
    if (!this.formData.email.trim()) {
      this.errorMessage = 'El email es obligatorio';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Email inválido';
      return false;
    }

    // Validar contraseña
    if (!this.formData.password) {
      this.errorMessage = 'La contraseña es obligatoria';
      return false;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    // Confirmar contraseña
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
