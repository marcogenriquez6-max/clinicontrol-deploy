import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';
export const Ownership = (resourceType: string) =>
  SetMetadata(OWNERSHIP_KEY, resourceType);
