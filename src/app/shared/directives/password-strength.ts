import { Directive, Output, EventEmitter } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

export interface PasswordStrengthState {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
  strength: 'débil' | 'media' | 'fuerte';
  percentage: number;
}

@Directive({
  selector: '[appPasswordStrength]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordStrengthDirective,
      multi: true
    }
  ]
})
export class PasswordStrengthDirective implements Validator {

  @Output() strengthChange = new EventEmitter<PasswordStrengthState>();

  validate(control: AbstractControl): ValidationErrors | null {

    const value: string = control.value || '';

    const hasMinLength = value.length >= 6;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    // Calcular el nivel de fortaleza y porcentaje
    let strength: 'débil' | 'media' | 'fuerte' = 'débil';
    let percentage = 0;

    const criteriosCumplidos = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

    if (criteriosCumplidos === 0) {
      percentage = 0;
      strength = 'débil';
    } else if (criteriosCumplidos === 1) {
      percentage = 33;
      strength = 'débil';
    } else if (criteriosCumplidos === 2) {
      percentage = 66;
      strength = 'media';
    } else {
      percentage = 100;
      strength = 'fuerte';
    }

    const state: PasswordStrengthState = {
      minLength: hasMinLength,
      uppercase: hasUppercase,
      number: hasNumber,
      strength: strength,
      percentage: percentage
    };

    this.strengthChange.emit(state);

    const isValid = hasMinLength && hasUppercase && hasNumber;

    if (!isValid) {
      return {
        passwordStrength: true
      };
    }

    return null;
  }
}
