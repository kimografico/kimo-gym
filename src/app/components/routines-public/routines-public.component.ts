import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Routine } from '../../interfaces';

@Component({
  selector: 'app-routines-public',
  templateUrl: './routines-public.component.html',
  styleUrls: ['./routines-public.component.scss'],
})
export class RoutinesPublicComponent {
  // Datos públicos (disponibles para todos)
  publicRoutines: Routine[] = [];

  // Estados de carga
  loading = {
    publicRoutines: false,
  };

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.loadPublicData();
  }

  // ============= CARGA DE DATOS PÚBLICOS =============

  async loadPublicData() {
    await Promise.all([this.loadPublicRoutines()]);
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
}
