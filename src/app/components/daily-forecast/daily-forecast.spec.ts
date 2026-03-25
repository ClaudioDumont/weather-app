import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyForecast } from './daily-forecast';

describe('DailyForecast', () => {
  let component: DailyForecast;
  let fixture: ComponentFixture<DailyForecast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyForecast],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyForecast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
