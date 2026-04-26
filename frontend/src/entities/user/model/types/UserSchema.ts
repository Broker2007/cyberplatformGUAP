export interface IUser {
  id: string;
  email:string;
  fullName:string;
  role:boolean;
  avatar: string | null;
}

export interface UserSchema {
  user: IUser | null;
}
