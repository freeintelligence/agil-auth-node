export interface User {
  [ key: string]: any;
  id?: string;
  username?: string;
  password?: string;
  data?: { [key: string]: any };
}
