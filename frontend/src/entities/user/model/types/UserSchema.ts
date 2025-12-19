export interface IUser {
  email:string;
  fullName:string;
  role:boolean;
  Avatar: string | null;
}

export interface UserSchema {
  user: IUser | null;
}
