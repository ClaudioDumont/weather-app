import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { PrecipitationUnit, TemperatureUnit, Weather, WindUnit } from '../../services/weather';

@Component({
  selector: 'app-unit-toggle',
  imports: [],
  templateUrl: './unit-toggle.html',
  styleUrl: './unit-toggle.scss',
})
export class UnitToggleComponent {
  private readonly weatherService = inject(Weather);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly units = toSignal(this.weatherService.units$, {
    initialValue: this.weatherService.units,
  });
  protected readonly open = signal(false);

  protected readonly isImperial = computed(() => this.units().temperature === 'fahrenheit');

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected toggleMenu(): void {
    this.open.update((value) => !value);
  }

  protected toggleSystem(): void {
    this.weatherService.toggleUnitSystem();
  }

  protected setTemperature(unit: TemperatureUnit): void {
    this.weatherService.setUnits({ temperature: unit });
  }

  protected setWind(unit: WindUnit): void {
    this.weatherService.setUnits({ wind: unit });
  }

  protected setPrecipitation(unit: PrecipitationUnit): void {
    this.weatherService.setUnits({ precipitation: unit });
  }
}
