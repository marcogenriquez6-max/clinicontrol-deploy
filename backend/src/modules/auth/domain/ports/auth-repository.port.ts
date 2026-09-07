import { UserDomain } from '../user.domain';

export abstract class AuthRepositoryPort {
  abstract findByEmail(email: string): Promise<UserDomain | null>;
  abstract findById(id: number): Promise<UserDomain | null>;
  abstract findByCi(ci: string): Promise<UserDomain | null>;
  abstract save(user: UserDomain): Promise<UserDomain>;
  abstract update(id: number, data: Partial<UserDomain>): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByCi(ci: string): Promise<boolean>;
}
