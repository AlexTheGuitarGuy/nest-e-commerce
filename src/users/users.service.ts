import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Role } from 'src/enums/role.enum';
export type User = {
  id: number;
  username: string;
  password: string;
  roles: Role[];
};
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, username: 'John Doe', password: 'test', roles: [Role.Customer] },
    {
      id: 2,
      username: 'Alice Caeiro',
      password: 'changeme',
      roles: [Role.Admin],
    },
    { id: 3, username: 'Who Knows', password: '1234', roles: [Role.Customer] },
  ];

  findOneByUsername(username: string): Observable<User | undefined> {
    return of(this.users.find((user) => user.username === username));
  }
}
