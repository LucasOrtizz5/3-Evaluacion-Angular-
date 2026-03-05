import { Directive, Output, EventEmitter } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

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

  @Output() strengthChange = new EventEmitter<any>();

  validate(control: AbstractControl): ValidationErrors | null {

    const value: string = control.value || '';

    const hasMinLength = value.length >= 6;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const state = {
      minLength: hasMinLength,
      uppercase: hasUppercase,
      number: hasNumber
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
