export interface ValidateErrorJSON {
  message: string;
  details?: { [name: string]: unknown };
}