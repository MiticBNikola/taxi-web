import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomAddressComponent } from './add-custom-address.component';

describe('AddCustomAddressComponent', () => {
  let component: AddCustomAddressComponent;
  let fixture: ComponentFixture<AddCustomAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
