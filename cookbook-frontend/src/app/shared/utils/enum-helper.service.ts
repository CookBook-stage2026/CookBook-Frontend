import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnumHelper {
  formatEnum(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  humanizedToEnum(humanized: string): string {
    if (!humanized) return '';
    return humanized
      .toUpperCase()
      .replaceAll(/\s+/g, '_');
  }

  formatMacroType(type: string): string {
    return this.formatEnum(type);
  }

  formatMacroValue(value: number, type: string): string {
    const unit = type === 'CALORIES' ? 'kcal' : 'g';

    const formattedValue = Number.isInteger(value)
      ? value.toFixed(0)
      : value.toFixed(1);

    return `${formattedValue} ${unit}`;
  }
}
