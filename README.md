## Solution

We'll be using NestJs, if you havent used it already its pretty much like Angular and I think it's a clever way to enable frontend developers to do thinks on the backend also. Anyway, it comes out with a CLI tool that allows generation of code. If you dont know whats a CLI this link explains it very well, same with NestJs, this link goes into detail of what NestJs is.

Assuming you know NestJs or that you read the articles I just gave you, let's go ahead and start coding.

### Start by creating the Services

In any microservices architecture you'll find multiple services running, either in the same machine or in totally distributed places. To start our small proof of concept, we'll create a service using the NestJs CLI. Just follow the next steps:

1. Create a new folder and go to it using you preferred command line tool.
2. Execute `nest new service-a`, it will prompt you to choose between npm and yarn, I used npm.
3. Delete the files `src/app.controller.spec.ts` and `src/app.service.ts`.
4. Remove the `AppService` from the imports and the `AppModule` provider.
5. Remove the `AppService` from the imports and the `AppController` constructor.

The `AppModule` will endpoint looking like this:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";

@Module({
  imports: [],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
```

The `AppController` will endpoint looking like this:

```typescript
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "hello";
  }
}
```

You got yourself your first service. Now is time to transform it into a microservice, thankfully NestJs covers a lot of it for you.
