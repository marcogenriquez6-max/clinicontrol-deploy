import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';

const ETIQUETAS = /<[^>]*>/g;
const PELIGROSOS = /[<>`]/g;

export function SanitizarTexto(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.replace(ETIQUETAS, '').replace(PELIGROSOS, '').trim();
  });
}

@ValidatorConstraint({ name: 'fechaNoFutura', async: false })
export class FechaNoFuturaConstraint implements ValidatorConstraintInterface {
  validate(fecha: string | Date) {
    if (!fecha) return true;
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() <= Date.now();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} no puede ser una fecha futura`;
  }
}

export function FechaNoFutura(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: FechaNoFuturaConstraint,
    });
  };
}
