import { IUser } from 'entities/user/model/types/UserSchema';

export interface IRegisterResponse {
  'status': string;
}
export interface ILoginResponse {
  'status': IUser;
  'token': string;
}
