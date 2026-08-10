import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Weather } from '../../services/weather';

@Component({
  selector: 'app-weather-metrics',
  imports: [CommonModule],
  templateUrl: './weather-metrics.html',
  styleUrl: './weather-metrics.scss',
})
export class WeatherMetricsComponent {
  protected readonly weatherService = inject(Weather);
  protected readonly state$ = this.weatherService.state$;
  protected readonly units$ = this.weatherService.units$;
}
