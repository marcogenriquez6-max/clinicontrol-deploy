import { describe, it, expect } from 'vitest';
import { errMsg } from './errMsg';

describe('errMsg', () => {
  it('extrae el mensaje de response.data.message (string)', () => {
    expect(
      errMsg({ response: { data: { message: 'Credenciales inválidas' } } }),
    ).toBe('Credenciales inválidas');
  });

  it('usa el primer elemento si message es un array', () => {
    expect(
      errMsg({ response: { data: { message: ['Campo requerido', 'Otro error'] } } }),
    ).toBe('Campo requerido');
  });

  it('cae al fallback cuando no hay response ni message', () => {
    expect(errMsg({})).toBe('Intente nuevamente');
  });

  it('cae al mensaje de error plano si no hay response', () => {
    expect(errMsg({ message: 'Error de red' })).toBe('Error de red');
  });

  it('usa el fallback personalizado cuando no hay respuesta', () => {
    expect(errMsg(null, 'Fallback custom')).toBe('Fallback custom');
  });

  it('cae al fallback ante datos no estructurados', () => {
    expect(errMsg('texto plano')).toBe('Intente nuevamente');
  });
});
