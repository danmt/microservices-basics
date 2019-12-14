import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping-a')
  pingServiceA() {
    return this.appService.pingServiceA();
  }

  @Get('/ping-b')
  pingServiceB() {
    return this.appService.pingServiceB();
  }

  @Get('/ping-all')
  pingAll() {
    return zip(
      this.appService.pingServiceA(),
      this.appService.pingServiceB(),
    ).pipe(
      map(([pongServiceA, pongServiceB]) => ({
        pongServiceA,
        pongServiceB,
      })),
    );
  }
}
