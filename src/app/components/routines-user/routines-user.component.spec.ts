import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutinesUserComponent } from './routines-user.component';

describe('RoutinesUserComponent', () => {
  let component: RoutinesUserComponent;
  let fixture: ComponentFixture<RoutinesUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoutinesUserComponent]
    });
    fixture = TestBed.createComponent(RoutinesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
