import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Weather } from '../../services/weather';
import { getWeatherIcon } from '../../utils/weather-icon';

@Component({
  selector: 'app-daily-forecast',
  imports: [CommonModule],
  templateUrl: './daily-forecast.html',
  styleUrl: './daily-forecast.scss',
})
export class DailyForecastComponent {
  protected readonly weatherService = inject(Weather);
  protected readonly state$ = this.weatherService.state$;
  protected readonly getWeatherIcon = getWeatherIcon;
  protected readonly skeletonDays = Array.from({ length: 7 });
}
