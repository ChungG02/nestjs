import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { CreateUserInput } from './types/create-user-input.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    const user = this.usersRepository.create({
      email: this.normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      displayName: input.displayName.trim(),
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: {
        email: this.normalizeEmail(email),
      },
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.passwordHash')
      .where('users.email = :email', {
        email: this.normalizeEmail(email),
      })
      .getOne();
  }

  async findActiveById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
