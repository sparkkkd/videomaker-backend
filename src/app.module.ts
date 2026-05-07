import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TabsModule } from './tabs/tabs.module';

@Module({
  imports: [TabsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
