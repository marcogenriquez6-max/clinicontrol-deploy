export class HealthDomain {
  constructor(
    public readonly status: string,
    public readonly timestamp: string,
    public readonly uptime: number,
    public readonly version: string,
    public readonly environment: string,
    public readonly database?: any,
    public readonly system?: any,
  ) {}
}
