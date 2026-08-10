import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph';
export type PrecipitationUnit = 'mm' | 'inch';

export interface Units {
  temperature: TemperatureUnit;
  wind: WindUnit;
  precipitation: PrecipitationUnit;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  feelsLike: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
}

export interface WeatherState {
  loading: boolean;
  error: string | null;
  locationName: string | null;
  country: string | null;
  current: CurrentWeather | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface GeocodingResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
}

const INITIAL_STATE: WeatherState = {
  loading: false,
  error: null,
  locationName: null,
  country: null,
  current: null,
  daily: [],
  hourly: [],
};

const METRIC_UNITS: Units = { temperature: 'celsius', wind: 'kmh', precipitation: 'mm' };
const IMPERIAL_UNITS: Units = { temperature: 'fahrenheit', wind: 'mph', precipitation: 'inch' };

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  private readonly http = inject(HttpClient);

  private readonly stateSubject = new BehaviorSubject<WeatherState>(INITIAL_STATE);
  readonly state$: Observable<WeatherState> = this.stateSubject.asObservable();

  private readonly unitsSubject = new BehaviorSubject<Units>(METRIC_UNITS);
  readonly units$: Observable<Units> = this.unitsSubject.asObservable();

  private lastPlace: GeocodingResult | null = null;

  get units(): Units {
    return this.unitsSubject.value;
  }

  getSuggestions(query: string): Observable<GeocodingResult[]> {
    const name = query.trim();
    if (!name) {
      return of([]);
    }

    return this.http
      .get<GeocodingResponse>(GEOCODING_URL, {
        params: { name, count: 5, language: 'en', format: 'json' },
      })
      .pipe(map((res) => res.results ?? []));
  }

  selectPlace(place: GeocodingResult): void {
    this.loadForecast(place);
  }

  searchLocation(query: string): void {
    const name = query.trim();
    if (!name) {
      return;
    }

    this.patchState({ loading: true, error: null });

    this.http
      .get<GeocodingResponse>(GEOCODING_URL, {
        params: { name, count: 1, language: 'en', format: 'json' },
      })
      .pipe(
        switchMap((geo) => {
          const place = geo.results?.[0];
          if (!place) {
            throw new Error('Location not found');
          }
          this.lastPlace = place;
          return this.fetchForecast(place);
        }),
        catchError((err) => {
          this.patchState({
            loading: false,
            error: err?.message ?? 'Something went wrong',
          });
          return of(null);
        })
      )
      .subscribe();
  }

  /** Updates one or more units and, if a location is already loaded, re-fetches its forecast in the new units. */
  setUnits(partial: Partial<Units>): void {
    this.unitsSubject.next({ ...this.unitsSubject.value, ...partial });

    if (this.lastPlace) {
      this.loadForecast(this.lastPlace);
    }
  }

  toggleUnitSystem(): void {
    const isImperial = this.unitsSubject.value.temperature === 'fahrenheit';
    this.setUnits(isImperial ? METRIC_UNITS : IMPERIAL_UNITS);
  }

  private loadForecast(place: GeocodingResult): void {
    this.patchState({ loading: true, error: null });
    this.lastPlace = place;

    this.fetchForecast(place)
      .pipe(
        catchError((err) => {
          this.patchState({
            loading: false,
            error: err?.message ?? 'Something went wrong',
          });
          return of(null);
        })
      )
      .subscribe();
  }

  private fetchForecast(place: GeocodingResult) {
    const units = this.unitsSubject.value;

    return this.http
      .get<ForecastResponse>(FORECAST_URL, {
        params: {
          latitude: place.latitude,
          longitude: place.longitude,
          current:
            'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
          hourly: 'temperature_2m,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min',
          temperature_unit: units.temperature,
          wind_speed_unit: units.wind,
          precipitation_unit: units.precipitation,
          timezone: 'auto',
        },
      })
      .pipe(
        tap((res) => {
          this.patchState({
            loading: false,
            error: null,
            locationName: place.name,
            country: place.country,
            current: {
              temperature: res.current.temperature_2m,
              weatherCode: res.current.weather_code,
              windSpeed: res.current.wind_speed_10m,
              humidity: res.current.relative_humidity_2m,
              feelsLike: res.current.apparent_temperature,
              precipitation: res.current.precipitation,
            },
            daily: res.daily.time.map((date, i) => ({
              date,
              weatherCode: res.daily.weather_code[i],
              tempMax: res.daily.temperature_2m_max[i],
              tempMin: res.daily.temperature_2m_min[i],
            })),
            hourly: res.hourly.time.map((time, i) => ({
              time,
              temperature: res.hourly.temperature_2m[i],
              weatherCode: res.hourly.weather_code[i],
            })),
          });
        })
      );
  }

  private patchState(partial: Partial<WeatherState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }
}
