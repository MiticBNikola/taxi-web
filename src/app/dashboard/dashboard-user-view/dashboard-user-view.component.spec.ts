import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUserViewComponent } from './dashboard-user-view.component';

describe('DashboardUserViewComponent', () => {
  let component: DashboardUserViewComponent;
  let fixture: ComponentFixture<DashboardUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardUserViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
