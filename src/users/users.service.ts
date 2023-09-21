import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
export type User = { id: number; username: string; password: string };
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, username: 'John Doe', password: 'test' },
    { id: 2, username: 'Alice Caeiro', password: 'changeme' },
    { id: 3, username: 'Who Knows', password: '1234' },
  ];

  findOneByUsername(username: string): Observable<User | undefined> {
    return of(this.users.find((user) => user.username === username));
  }
}
