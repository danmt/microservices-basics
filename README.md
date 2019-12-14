## Solution

We'll be using NestJs, if you havent used it already its pretty much like Angular and I think it's a clever way to enable frontend developers to do thinks on the backend also. Anyway, it comes out with a CLI tool that allows generation of code. If you dont know whats a CLI this link explains it very well, same with NestJs, this link goes into detail of what NestJs is.

Assuming you know NestJs or that you read the articles I just gave you, let's go ahead and start coding.

### Create the first service

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

You got yourself your first service. Now is time to transform it into a microservice, thankfully NestJs covers a lot of it for you. By default NestJs applications are generated as a server that uses HTTP is its transport layer, in the case of microservices that's not what you want. When working with microservices you are commonly using TCP instead.

> If you are confused about HTTP or TCP, imagine they are just languages. A traditional Http Server talks in _English_ and a microservice using TCP talks in _Spanish_.

Since the service is structurally ready to be transformed to a microservice using NestJs, we'll first the next steps:

1. Go to the service folder using you preferred command line tool
2. Execute the command `npm i --save @nestjs/microservices`
3. Update the entry point of the service `src/main.ts` with the service configuration

The entry point should end up looking like this:

```typescript
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: "127.0.0.1",
      port: 8888
    }
  });
  app.listen(() => logger.log("Microservice A is listening"));
}
bootstrap();
```

Are you wondering what's going on here? Let's explain it.

1. We are using the `createMicroservice` instead of the default `create`.
2. Now we have to provide an extra argument for the Transport and Microservice Options.
3. Inside the microservice options we tell NestJs the host and port we want to use.

> NOTE: You can choose the host and port of your preference. Also, NestJs multiple transport options you can choose from.
