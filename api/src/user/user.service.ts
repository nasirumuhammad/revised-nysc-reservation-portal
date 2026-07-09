import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { HashingService } from '@/common/services/hash.service';
import { maskEmail } from '@/common/utils/mask.util';
import { SignInDto } from '@/auth/dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import { Role } from '@/common/enums';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);
  private readonly adminEmail: string;
  private readonly adminPassword: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    configService: ConfigService,
  ) {
    this.adminEmail = configService.getOrThrow<string>('ADMIN_EMAIL');
    this.adminPassword = configService.getOrThrow<string>('ADMIN_PASSWORD');
  }

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
  }

  async seedAdmin(): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email: this.adminEmail },
    });
    if (existingUser) {
      return;
    }
    const hashedPassword = await this.hashingService.hash(this.adminPassword);
    const user = this.userRepository.create({
      email: this.adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    });
    await this.userRepository.save(user);

    this.logger.log({ email: maskEmail(this.adminEmail) }, 'admin user seeded');
  }

  async create(payload: SignInDto): Promise<User> {
    const { email, password } = payload;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn(
        { email: maskEmail(email) },
        'create user: existing user attempting to create an account',
      );
      throw new BadRequestException();
    }
    const hashedPassword = await this.hashingService.hash(password);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.userRepository.increment({ id }, 'tokenVersion', 1);
  }

  async deleteUsers(id: string[]): Promise<void> {
    await this.userRepository.softDelete({ id: In(id) });
  }

  async resetPassword(email: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(
        { email: maskEmail(email) },
        'reset password: user not found',
      );
      throw new BadRequestException('Invalid request');
    }
    const hashedPassword = await this.hashingService.hash(password);
    user.tokenVersion += 1;
    user.password = hashedPassword;
    await this.userRepository.save(user);
    this.logger.log({ email: maskEmail(email) }, 'Password reset successfully');
  }
}
