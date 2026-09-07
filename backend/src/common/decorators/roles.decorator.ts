import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const REQUIRE_BOTH_KEY = 'requireBoth';
export { IS_PUBLIC_KEY } from './public.decorator';

export type RoleName =
  | 'admin'
  | 'gerente'
  | 'secretaria'
  | 'medico'
  | 'enfermeria'
  | 'recepcionista'
  | 'paciente';

export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireBoth = () => SetMetadata(REQUIRE_BOTH_KEY, true);
