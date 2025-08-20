import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Exercise, User, Routine, Session } from '../../interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  exercises: Exercise[] = [];
  users: User[] = [];
  routines: Routine[] = [];
  sessions: Session[] = [];

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    this.exercises = await this.dataService.getAll('Exercise');
    this.users = await this.dataService.getAll('User');
    this.routines = await this.dataService.getAll('Routine');
    this.sessions = await this.dataService.getAll('Session');
  }

  avatar(filename: string) {
    return this.dataService.getAvatarUrl(filename);
  }
}
