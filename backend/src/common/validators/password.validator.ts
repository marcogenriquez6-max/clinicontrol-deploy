import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'strongPassword', async: false })
export class StrongPasswordValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) return false;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
  }

  defaultMessage(): string {
    return 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial';
  }
}
