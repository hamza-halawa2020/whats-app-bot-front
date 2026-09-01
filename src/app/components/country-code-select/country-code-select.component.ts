import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';

export interface CountryOption {
  code: string;
  dialCode: string;
  name: string;
}

@Component({
  selector: 'app-country-code-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-code-select.component.html',
  styleUrls: ['./country-code-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryCodeSelectComponent),
      multi: true,
    },
  ],
})
export class CountryCodeSelectComponent implements ControlValueAccessor {
  @Input() label = 'Country';
  @Input() searchPlaceholder = 'Search country or code';
  @Input() selectId = 'countryCode';
  @Input() disabled = false;
  @Input() excludeCountries: string[] = ['IL'];
  @Input() extraCountries: CountryOption[] = [];

  countries = this.buildCountryOptions();
  countrySearch = '';
  value = 'EG';
  isOpen = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get filteredCountries(): CountryOption[] {
    const search = this.countrySearch.trim().toLowerCase();
    const excluded = new Set(this.excludeCountries.map((code) => code.toUpperCase()));
    const availableCountries = this.allCountries.filter(
      (country) => !excluded.has(country.code)
    );

    if (!search) {
      return availableCountries;
    }

    return availableCountries.filter((country) =>
      country.name.toLowerCase().includes(search) ||
      country.code.toLowerCase().includes(search) ||
      country.dialCode.includes(search)
    );
  }

  writeValue(value: string | null): void {
    this.value = value || 'EG';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  updateValue(value: string): void {
    this.value = value;
    this.isOpen = false;
    this.countrySearch = '';
    this.onChange(value);
    this.onTouched();
  }

  toggleOpen(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  markTouched(): void {
    this.onTouched();
  }

  get selectedCountry(): CountryOption {
    return this.allCountries.find((country) => country.code === this.value) || this.countries[0];
  }

  private get allCountries(): CountryOption[] {
    const countries = [...this.countries, ...this.normalizedExtraCountries];
    return countries.filter(
      (country, index, items) =>
        items.findIndex((item) => item.code === country.code) === index
    );
  }

  private get normalizedExtraCountries(): CountryOption[] {
    return this.extraCountries.map((country) => ({
      code: country.code.trim().toUpperCase(),
      dialCode: country.dialCode.startsWith('+') ? country.dialCode : `+${country.dialCode}`,
      name: country.name.trim(),
    }));
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  private buildCountryOptions(): CountryOption[] {
    const phoneUtil = PhoneNumberUtil.getInstance();
    const displayNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null;

    return phoneUtil
      .getSupportedRegions()
      .map((code: string) => ({
        code,
        dialCode: `+${phoneUtil.getCountryCodeForRegion(code)}`,
        name: displayNames?.of(code) || code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
