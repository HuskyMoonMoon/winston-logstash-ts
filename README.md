# winston-logstash-ts
A winston logstash transport to UDP protocol in Typescript. Rewrite from https://github.com/liuyanjie/winston-logstash-transport

## Dependencies
- logform: "^2.1.2",
- winston: "^3.2.1",
- winston-transport: "^4.3.0"

## Installation
- Install to your project using `npm -i winston-logstash-ts` or `yarn add winston-logstash-ts`

## Example
- Manually create logstash transport, then add to an existing winston instance
```typescript
import { LogstashTransport } from "winston-logstash-ts"
.
.
const logstash = new LogstashTransport({
    host: "logstash.hostname.or.ip",
    port: 11200,
    format: logform.format.combine(
        logform.format.timestamp(),
        logform.format.logstash(),
    )
});
winston.add(logstash);
.
.
```
- Use `LogstashTransport.createLogger()` static method to create winston logger with logstash transport
```typescript
import { LogstashTransport } from "winston-logstash-ts"
.
.
const logger = LogstashTransport.createLogger("<APP_NAME>", {
    host: "logstash.hostname.or.ip",
    port: 11200,
    format: logform.format.combine(
        logform.format.timestamp(),
        logform.format.logstash(),
    )
});
```
The option type is `LogstashOption` (https://github.com/HuskyMoonMoon/winston-logstash-ts/blob/master/src/LogstashOption.ts), which is extended from `winston.LoggerOption`
