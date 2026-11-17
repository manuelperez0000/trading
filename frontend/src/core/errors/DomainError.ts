export class DomainError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

export class UnauthorizedLicenseError extends DomainError {
  constructor(licenseKey: string, reason: string) {
    super(
      'UNAUTHORIZED_LICENSE',
      `Licencia [${licenseKey}] denegada: ${reason}`
    );
  }
}

export class MachineIdMismatchError extends DomainError {
  constructor(expectedMachineId: string, receivedMachineId: string) {
    super(
      'MACHINE_ID_MISMATCH',
      `Bloqueo de seguridad por Hardware: se esperaba MachineID [${expectedMachineId}] pero conectó [${receivedMachineId}].`
    );
  }
}

export class InvalidSignatureError extends DomainError {
  constructor() {
    super(
      'INVALID_HMAC_SIGNATURE',
      'La firma criptográfica HMAC-SHA256 del paquete de NinjaTrader es inválida o fue manipulada.'
    );
  }
}

export class HttpInfrastructureError extends DomainError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super('HTTP_INFRASTRUCTURE_ERROR', message);
    this.statusCode = statusCode;
  }
}
