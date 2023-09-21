import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
export type User = { id: number; name: string; password: string };
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, name: 'John Doe', password: 'test' },
    { id: 2, name: 'Alice Caeiro', password: 'changeme' },
    { id: 3, name: 'Who Knows', password: '1234' },
  ];

  findOneByUsername(username: string): Observable<User | undefined> {
    return of(this.users.find(({ name }) => name === username));
  }
}
