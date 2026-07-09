import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from '../configs/database.config';
import { throttlerConfig } from '../configs/throttler.config';
import { bullConfig } from '../configs/bull.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(dbConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync(throttlerConfig),
    BullModule.forRootAsync(bullConfig),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
})
export class GlobalConfigModule {}
