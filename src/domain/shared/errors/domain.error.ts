export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export abstract class DomainError extends Error {
  public readonly statusCode: HttpStatusCode;

  protected constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier?: string | number) {
    const detail = identifier !== undefined ? ` with identifier '${identifier}'` : '';
    super(`${entityName}${detail} not found`, HttpStatusCode.NOT_FOUND);
  }
}

export class InvalidParameterError extends DomainError {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class DomainValidationError extends DomainError {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class ExternalServiceUnavailableError extends DomainError {
  constructor(message: string) {
    super(message, HttpStatusCode.SERVICE_UNAVAILABLE);
  }
}

