import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Weather } from '../../services/weather';
import { getWeatherIcon } from '../../utils/weather-icon';

@Component({
  selector: 'app-hourly-forecast',
  imports: [CommonModule],
  templateUrl: './hourly-forecast.html',
  styleUrl: './hourly-forecast.scss',
})
export class HourlyForecastComponent {
  private readonly weatherService = inject(Weather);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly getWeatherIcon = getWeatherIcon;
  protected readonly state = toSignal(this.weatherService.state$);
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly dropdownOpen = signal(false);
  protected readonly days = computed(() => this.state()?.daily.map((d) => d.date) ?? []);

  protected readonly hours = computed(() => {
    const date = this.selectedDate();
    if (!date) {
      return [];
    }
    return (this.state()?.hourly ?? []).filter((hour) => hour.time.startsWith(date));
  });

  protected readonly isLoading = computed(() => this.state()?.loading ?? false);
  protected readonly skeletonHours = Array.from({ length: 8 });

  constructor() {
    effect(() => {
      const days = this.days();
      if (days.length && !days.includes(this.selectedDate()!)) {
        this.selectedDate.set(days[0]);
      }
    });

    effect(() => {
      if (this.isLoading()) {
        this.dropdownOpen.set(false);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen.set(false);
    }
  }

  protected toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  protected selectDay(date: string): void {
    this.selectedDate.set(date);
    this.dropdownOpen.set(false);
  }
}
