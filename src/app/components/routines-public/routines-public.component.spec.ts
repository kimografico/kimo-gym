import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutinesPublicComponent } from './routines-public.component';

describe('RoutinesPublicComponent', () => {
  let component: RoutinesPublicComponent;
  let fixture: ComponentFixture<RoutinesPublicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoutinesPublicComponent]
    });
    fixture = TestBed.createComponent(RoutinesPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
