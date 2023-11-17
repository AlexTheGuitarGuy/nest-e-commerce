import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable, from, concatMap, map, of, catchError, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  DeleteResult,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PostgresErrorCode } from 'src/common/enums/postgres-error-code.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _usersRepository: Repository<UserEntity>,
  ) {}

  create(createUserDto: CreateUserDto): Observable<UserEntity> {
    const { password, ...rest } = createUserDto;

    return from(bcrypt.hash(password, 10)).pipe(
      concatMap((hashedPassword) => {
        const user = this._usersRepository.create({
          ...rest,
          password: hashedPassword,
        });

        return from(this._usersRepository.save(user));
      }),
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
    );
  }

  findMany(
    where: FindOptionsWhere<UserEntity>,
    relations: FindOptionsRelations<UserEntity>,
    select: FindOptionsSelect<UserEntity>,
    take: number = 50,
    skip: number = 0,
  ): Observable<{ items: UserEntity[]; itemsCount: number }> {
    return from(
      this._usersRepository.findAndCount({
        where,
        relations,
        select: { ...select },
        take,
        skip,
      }),
    ).pipe(
      map(([items, itemsCount]) => {
        const logPayload = {
          where,
          relations,
          select,
        };
        if (items.length) {
          Object.assign(logPayload, { ids: items.map((e) => e.id) });
        }

        return { items, itemsCount };
      }),
    );
  }

  removeOne(id: number): Observable<DeleteResult> {
    return from(this._usersRepository.delete(id)).pipe(
      tap((deleted) => {
        if (deleted.affected === 0) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
      }),
    );
  }

  findOneByUsername(username: string): Observable<UserEntity> {
    return from(this._usersRepository.findOne({ where: { username } })).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`User not found`);
        }
        return found;
      }),
    );
  }

  findOneById(id: number): Observable<UserEntity> {
    return from(
      this._usersRepository.findOne({ where: { id }, relations: ['payer'] }),
    ).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`User not found`);
        }
        return found;
      }),
    );
  }

  validate(username: string, password: string): Observable<UserEntity | null> {
    return from(
      this._usersRepository.findOne({
        where: { username },
        relations: ['payer'],
      }),
    ).pipe(
      concatMap((user) => {
        if (!user || !bcrypt.compareSync(password, user.password))
          return of(null);

        return from(this._usersRepository.save(user));
      }),
    );
  }

  updateOne(id: number, updateUserDto: UpdateUserDto): Observable<UserEntity> {
    return from(this._usersRepository.findOne({ where: { id } })).pipe(
      map((foundUser) => {
        if (!foundUser) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
        return foundUser;
      }),
      concatMap((foundUser) => {
        const updated = this._usersRepository.merge(foundUser, updateUserDto);
        return from(this._usersRepository.save(updated));
      }),
      catchError((error: any) => {
        if (error?.code === PostgresErrorCode.UniqueViolation) {
          throw new BadRequestException('This user already exists');
        }
        throw new BadRequestException(error.detail);
      }),
    );
  }

  updatePassword(id: number, newPassword: string) {
    return this.findOneById(id).pipe(
      concatMap((foundUser) => {
        const updated = this._usersRepository.merge(foundUser, {
          password: newPassword,
        });
        return from(this._usersRepository.save(updated));
      }),
    );
  }

  markEmailAsConfirmed(email: string): Observable<UserEntity> {
    return from(this._usersRepository.findOne({ where: { email } })).pipe(
      map((foundUser) => {
        if (!foundUser) {
          throw new NotFoundException(`User with email ${email} not found`);
        } else if (foundUser.isEmailConfirmed) {
          throw new BadRequestException('Email already confirmed');
        }
        return foundUser;
      }),
      concatMap((foundUser) => {
        foundUser.isEmailConfirmed = true;
        return from(this._usersRepository.save(foundUser));
      }),
    );
  }
}
