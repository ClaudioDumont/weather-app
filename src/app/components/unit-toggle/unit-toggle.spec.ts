import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitToggle } from './unit-toggle';

describe('UnitToggle', () => {
  let component: UnitToggle;
  let fixture: ComponentFixture<UnitToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
