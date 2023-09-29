import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Observable, from, switchMap, map, of, catchError } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PostgresErrorCode } from 'src/enums/postgres-error-code.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _usersRepository: Repository<UserEntity>,
  ) {}

  create(createUserDto: CreateUserDto): Observable<UserDto> {
    const { password, ...rest } = createUserDto;

    return from(bcrypt.hash(password, 10)).pipe(
      switchMap((hashedPassword) => {
        const user = this._usersRepository.create({
          ...rest,
          password: hashedPassword,
        });

        return from(this._usersRepository.save(user));
      }),
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
      map((user) => plainToInstance(UserDto, user)),
    );
  }

  findAll(): Observable<UserDto[]> {
    return from(this._usersRepository.find({ take: 999 })).pipe(
      map((users) => plainToInstance(UserDto, users)),
    );
  }

  remove(id: number): Observable<any> {
    return from(this._usersRepository.delete(id));
  }

  findOneByUsername(username: string): Observable<UserDto | undefined> {
    return from(this._usersRepository.findOne({ where: { username } })).pipe(
      map((user) => plainToInstance(UserDto, user)),
    );
  }

  findOneById(id: number): Observable<UserDto> {
    return from(this._usersRepository.findOne({ where: { id } })).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`User not found`);
        }
        return found;
      }),
      map((user) => plainToInstance(UserDto, user)),
    );
  }

  validate(username: string, password: string): Observable<UserDto | null> {
    return from(this._usersRepository.findOne({ where: { username } })).pipe(
      switchMap((user) => {
        if (!user || !bcrypt.compareSync(password, user.password))
          return of(null);

        return from(this._usersRepository.save(user)).pipe(
          map((user) => plainToInstance(UserDto, user)),
        );
      }),
    );
  }

  updateOne(id: number, updateUserDto: UpdateUserDto): Observable<UserDto> {
    return from(this._usersRepository.findOne({ where: { id } })).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`User not found`);
        }
        return found;
      }),
      switchMap((found) => {
        if (!updateUserDto.password) return of(found);

        return from(bcrypt.hash(updateUserDto.password, 10)).pipe(
          map((hashedPassword) => {
            updateUserDto.password = hashedPassword;
            return found;
          }),
        );
      }),
      switchMap((found) => {
        try {
          const updated = this._usersRepository.merge(found, updateUserDto);
          return from(this._usersRepository.save(updated));
        } catch (error: any) {
          if (error?.code === PostgresErrorCode.UniqueViolation) {
            throw new BadRequestException('This user already exists');
          }
          throw new InternalServerErrorException('Failed to update user');
        }
      }),
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
      map((user) => plainToInstance(UserDto, user)),
    );
  }
}
