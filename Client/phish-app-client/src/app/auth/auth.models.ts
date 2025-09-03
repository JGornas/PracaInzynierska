export class LoginModel {
  email: string = '';
  password: string = '';
}

export class SetPasswordFormModel {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
}

export interface JwtPayload {
  mustSetPassword?: string;
  [key: string]: any;
}
