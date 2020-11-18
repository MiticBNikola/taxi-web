import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDispatcherViewComponent } from './dashboard-dispatcher-view.component';

describe('DashboardDispatcherViewComponent', () => {
  let component: DashboardDispatcherViewComponent;
  let fixture: ComponentFixture<DashboardDispatcherViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardDispatcherViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDispatcherViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
