import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TabsModule } from './tabs/tabs.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [TabsModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
