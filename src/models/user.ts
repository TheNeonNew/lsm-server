export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  position: string;
}

export interface StoredUser extends User {
  password: string;
}
