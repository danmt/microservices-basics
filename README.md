# Build an API Gateway with NestJs in 10 minutes

This article intention is to give you a broader perspective into the Microservices architecture. There's many people out there claiming they have a Microservice oriented architecture but they lack of the core concepts on which this pattern relies. My goal is to write a set of articles looking to clear all the fog that appears when shifting from monolithic to highly distributed applications.

The Microservices world is full of interesting and incredibly hard to implement stuff. When you get started you think that by just dividing your app in multiple services you are already there. Sadly, that's almost never true. It's more common than you think to see people building highly critical apps this way, without having in place all the core concepts.

In this article I'm going to focus in the pattern API Gateway . If you are doing Microservice architecture you **SHOULD** know it pretty well, being that the case use this article to make sure you have clear knowledge on these concepts. If you are enterily new to Microservices, have fun and enjoy the ride.

In traditional monolithic applications, API clients consume everything from the same location. Although, once you start using microservices things start to change, you may have multiple services running on entirely different locations.

## What API Gateway means

The non deterministic nature of microservice architecture lead us directly to whole new mess. But what can you do about it? One of the approaches out there is the API Gateway. From a 10,000ft view it's just an extra service that you put in front of your other services so you can do composition of services.

## The Problem

Let's say you have an application that consists on multiple services. We want to have our services location hidden from clients, so we'll have a proxy service that has to be able to compose multiple requests.

## The Solution

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
4. Update the `AppController` to use the Microservice Message pattern to serve clients

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

The `AppController` will end up looking like this:

```typescript
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { of } from "rxjs";
import { delay } from "rxjs/operators";

@Controller()
export class AppController {
  @MessagePattern({ cmd: "ping" })
  ping(_: any) {
    return of("pong").pipe(delay(1000));
  }
}
```

Instead of using the classic `Get` decorator we use the `MessagePattern`, what this will do is trigerring the `ping` method when it receives a **ping** command. Then it just returns the string **pong** after a second delay.

If you want to skip ahead you can access this [working version of create the first service](https://github.com/danmt/microservices-basics/tree/create-the-first-service)

### Build the API Gateway

You have a new service to run, but how can you access it? That's what we are going to do next. We'll create a new service that works as a HTTP Server and will map the request to the right service. This will like a proxy that also allows you to compose requests and reduce bandwidth usage in your applications.

> If you are wondering who uses this, AWS offers it as SaaS. Netflix even built their own solution.

Let's put in use your knowledge on the NestJs CLI:

1. Go to the root of the project using your preferred command line tool.
2. Execute `nest new api-gateway`, it will prompt you to choose between npm and yarn, I used npm.
3. Delete the files `src/app.controller.spec.ts`.

You are probably thinking, is that it? Well, no. But we are almost there, is time to hook the method we created.

1. Go to the root to the API Gateway root folder using your preferred command line tool.
2. Execute the command `npm i --save @nestjs/microservices`.
3. Import the `ClientModule` and register the `ServiceA`.
4. Inject the new service into the `AppService` and create a method to query the `ServiceA`.
5. Use the new method from the `AppService` in the `AppController`.

The `AppModule` will end up looking like this:

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "SERVICE_A",
        transport: Transport.TCP,
        options: {
          host: "127.0.0.1",
          port: 8888
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

As you can see we need to setup the client to the service using the same transport and options but we give it a new property `name` to identify the instance of the service. You can also create a custom provider in order to fetch its configuration either from a service that can be local or externally accesed using HTTP.

The `AppService` will end up looking like this:

```typescript
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map } from "rxjs/operators";

@Injectable()
export class AppService {
  constructor(
    @Inject("SERVICE_A") private readonly clientServiceA: ClientProxy
  ) {}

  pingServiceA() {
    const startTs = Date.now();
    const pattern = { cmd: "ping" };
    const payload = {};
    return this.clientServiceA
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }
}
```

What we are doing here is injecting the Client we imported in the `AppModule` using its name as the token to identify it. Then we create a simple method that gets the current time in milliseconds, sends a message to the service instance and once it gets a response it maps it to an object with the response message and it's total duration.

The `AppController` will end up looking like this:

```typescript
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping-a")
  pingServiceA() {
    return this.appService.pingServiceA();
  }
}
```

If you start `api-gateway` and `service-a` services using `npm run start:dev`, you'll be able to send a get request to your localhost under the port you chose for the api gateway, to the path _/ping-a_ and get as a response an object with a message saying **pong** and the duration it took.

Although, this is not that impressive right? We could do this with a simple proxy. Things get slightly more complicated when you want to compose requests. But before we'll need to create a new service. Go ahead yourself and create the second service and hook it on the API Gateway as I have just showed you.

If you want to skip ahead you can access the [api gateway with one service](https://github.com/danmt/microservices-basics/tree/build-the-api-gateway) or [the api gateway with the two services](https://github.com/danmt/microservices-basics/tree/create-the-second-service)

> NOTE: In the second service I used a delay of 2 seconds so we can see the difference between services available.

### Composing Requests

We have everything in place, two services than can be running anywhere communicating through a single interface bringing more security and modularity to the application. But we want more, what if we had 12 services and we had to do over 100 requests to fill all the information in a single page, things start to get out of hand.

We need a way to compose requests in the Api Gateway, for this I'm going to use some RxJs. The `AppController` of the Api Gateway will end up looking like this:

```typescript
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { zip } from "rxjs";
import { map } from "rxjs/operators";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping-a")
  pingServiceA() {
    return this.appService.pingServiceA();
  }

  @Get("/ping-b")
  pingServiceB() {
    return this.appService.pingServiceB();
  }

  @Get("/ping-all")
  pingAll() {
    return zip(
      this.appService.pingServiceA(),
      this.appService.pingServiceB()
    ).pipe(
      map(([pongServiceA, pongServiceB]) => ({
        pongServiceA,
        pongServiceB
      }))
    );
  }
}
```

The only thing new is the `pingAll` method. If you havent seen RxJs before this might look like some dark magic but its actually quite simple, we want to start the execution of our asynchronous calls in the same time and consolidates all the responses into a single one.

> NOTE: The zip method takes _N_ observables and emits once all have emitted.

If you dont want to do any of this by yourslef just access this [working version of the application](https://github.com/danmt/microservices-basics/)

## Conclusion

And just like that, you got the API Gateway to compose requests for you. This is just a taste of what Microservices can do for your architecture, there are many more patterns like API Gateway that you can explore. A cool homework would be to create a new service that keeps track of the running services and extending the imports using providers to allow dinamically setting the client specification.
