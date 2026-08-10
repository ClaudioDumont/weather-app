import { Component, OnDestroy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
import { GeocodingResult, Weather } from '../../services/weather';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 200;

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBarComponent implements OnDestroy {
  private readonly weatherService = inject(Weather);
  private readonly queryChanges = new Subject<string>();

  public searchQuery = '';
  protected suggestions: GeocodingResult[] = [];
  protected suggestionsOpen = false;
  protected activeIndex = -1;

  private readonly subscription: Subscription = this.queryChanges
    .pipe(
      debounceTime(DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.trim().length < MIN_QUERY_LENGTH) {
          return of<GeocodingResult[]>([]);
        }
        return this.weatherService
          .getSuggestions(query)
          .pipe(catchError(() => of<GeocodingResult[]>([])));
      }),
    )
    .subscribe((results) => {
      this.suggestions = results;
      this.suggestionsOpen = results.length > 0;
      this.activeIndex = -1;
    });

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onInputChange(value: string): void {
    this.searchQuery = value;
    this.queryChanges.next(value);
  }

  public onFocus(): void {
    if (this.suggestions.length > 0) {
      this.suggestionsOpen = true;
    }
  }

  public onBlur(): void {
   setTimeout(() => this.closeSuggestions(), 150);
  }

  public onKeydown(event: KeyboardEvent): void {
    if (!this.suggestionsOpen || this.suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Escape') {
      this.closeSuggestions();
    }
  }

  public onSearch(): void {
    if (this.activeIndex >= 0 && this.suggestions[this.activeIndex]) {
      this.selectSuggestion(this.suggestions[this.activeIndex]);
      return;
    }
    this.weatherService.searchLocation(this.searchQuery);
    this.closeSuggestions();
  }

  public selectSuggestion(place: GeocodingResult): void {
    this.searchQuery = this.formatPlaceLabel(place);
    this.weatherService.selectPlace(place);
    this.closeSuggestions();
  }

  protected formatPlaceLabel(place: GeocodingResult): string {
    return place.admin1
      ? `${place.name}, ${place.admin1}, ${place.country}`
      : `${place.name}, ${place.country}`;
  }

  private closeSuggestions(): void {
    this.suggestionsOpen = false;
    this.suggestions = [];
    this.activeIndex = -1;
  }
}
