import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ci', async: false })
export class CiValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) return true;
    const patterns = [
      /^\d{5,10}$/,
      /^[VEJPGvejpg]-\d{5,10}$/,
      /^\d{5,10}-\d{1,2}$/,
    ];
    return patterns.some((p) => p.test(value));
  }

  defaultMessage(): string {
    return 'Formato de cédula inválido (ej: V-12345678 o 12345678)';
  }
}
