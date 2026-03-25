import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './components/search-bar/search-bar';
import { WeatherCardComponent } from './components/weather-card/weather-card';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast';
import { UnitToggleComponent } from './components/unit-toggle/unit-toggle';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    SearchBarComponent,
    WeatherCardComponent,
    HourlyForecastComponent,
    DailyForecastComponent,
    UnitToggleComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weather-app');
}
