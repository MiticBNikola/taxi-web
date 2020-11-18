import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDriverViewComponent } from './dashboard-driver-view.component';

describe('DashboardDriverViewComponent', () => {
  let component: DashboardDriverViewComponent;
  let fixture: ComponentFixture<DashboardDriverViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardDriverViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDriverViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
