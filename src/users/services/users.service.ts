import { BadRequestException, Injectable } from '@nestjs/common';
import { Observable, from, concatMap, map, of } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { TypeormCrudRepository } from 'src/common/typeorm/typeorm-crud.repository';

@Injectable()
export class UsersService extends TypeormCrudRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _usersRepository: Repository<UserEntity>,
  ) {
    super(_usersRepository);
    this.entityName = 'user';
  }

  createOneWithPassword(createUserDto: CreateUserDto): Observable<UserEntity> {
    const { password, ...rest } = createUserDto;

    return from(bcrypt.hash(password, 10)).pipe(
      concatMap((hashedPassword) =>
        this.createOne({ ...rest, password: hashedPassword }),
      ),
    );
  }

  validate(username: string, password: string): Observable<UserEntity | null> {
    return from(
      this.findOneOrThrow({
        where: { username },
      }),
    ).pipe(
      concatMap((user) => {
        if (!user || !bcrypt.compareSync(password, user.password))
          return of(null);

        return from(this._usersRepository.save(user));
      }),
    );
  }

  markEmailAsConfirmed(email: string): Observable<UserEntity> {
    return from(this.findOneOrThrow({ where: { email } })).pipe(
      map((foundUser) => {
        if (foundUser.isEmailConfirmed)
          throw new BadRequestException('Email already confirmed');

        return foundUser;
      }),
      concatMap((foundUser) => {
        foundUser.isEmailConfirmed = true;
        return from(this._usersRepository.save(foundUser));
      }),
    );
  }
}
