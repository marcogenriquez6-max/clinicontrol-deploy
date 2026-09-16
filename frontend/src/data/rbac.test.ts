import { describe, it, expect } from 'vitest';
import { ROLES_MATRIZ, ROLES_KEYS } from './rbac';

describe('ROLES_MATRIZ (RBAC)', () => {
  it('define los seis roles operativos de la clínica', () => {
    expect(ROLES_KEYS.sort()).toEqual([
      'admin',
      'enfermeria',
      'gerente',
      'medico',
      'recepcionista',
      'secretaria',
    ]);
  });

  it('cada rol tiene los campos obligatorios de RolInfo', () => {
    for (const key of ROLES_KEYS) {
      const rol = ROLES_MATRIZ[key];
      expect(rol.key).toBe(key);
      expect(typeof rol.nombre).toBe('string');
      expect(rol.nombre.length).toBeGreaterThan(0);
      expect(typeof rol.descripcion).toBe('string');
      expect(typeof rol.color).toBe('string');
      expect(Array.isArray(rol.hu)).toBe(true);
      expect(Array.isArray(rol.capacidades)).toBe(true);
      expect(Array.isArray(rol.modulos)).toBe(true);
    }
  });

  it('las claves del objeto coinciden con las de ROLES_KEYS', () => {
    expect(Object.keys(ROLES_MATRIZ).sort()).toEqual(ROLES_KEYS.sort());
  });

  it('cada rol con interacción asistencial declara al menos un módulo asistencial', () => {
    const asistenciales = ['medico', 'enfermeria'];
    for (const key of asistenciales) {
      expect(ROLES_MATRIZ[key].modulos.length).toBeGreaterThan(0);
    }
  });

  it('el rol medico cubre la seguridad farmacológica (RF-11) y la consulta SOAP', () => {
    const medico = ROLES_MATRIZ.medico;
    expect(medico.hu).toContain('RF-11');
    expect(medico.modulos).toContain('Agenda del Día');
    expect(medico.modulos).toContain('Historia Clínica');
    expect(medico.modulos).toContain('Recetas');
  });

  it('el rol admin no tiene acceso al padrón de pacientes ni a la historia clínica', () => {
    const admin = ROLES_MATRIZ.admin;
    expect(admin.modulos).not.toContain('Pacientes');
    expect(admin.modulos).not.toContain('Historia Clínica');
  });
});
