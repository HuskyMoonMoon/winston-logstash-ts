import * as dgram from "dgram";
import * as os from "os";
import * as winston from "winston";
import * as Transport from "winston-transport";
import * as logform from "logform"
import { LogstashOption } from "./LogstashOption";

export class LogstashTransport extends Transport {

  public readonly name = "LogstashTransport";
  protected host: string;
  protected port: number;
  protected client: dgram.Socket;

  constructor(options?: LogstashOption) {
    super(options);

    this.host = options.host;
    this.port = options.port;
    this.silent = options.silent;

    this.client = null;

    this.connect();
  }

  public connect() {
    this.client = dgram.createSocket("udp4");
    this.client.unref();
  }

  public log(info: any, callback: Function) {
    if (this.silent) {
      return callback(null, true);
    }

    this.send(info, (err) => {
      this.emit("logged", !err);
      callback(err, !err);
    })
  }

  public send(message, callback) {
    message = this.format.transform(message);
    const buf = Buffer.from(message);
    this.client.send(buf, 0, buf.length, this.port, this.host, (callback || (() => { })));
  }

  public static createLogger(logType: string, winstonOption: winston.LoggerOptions, logstashOption: LogstashOption) {
    const appendMetaInfo = winston.format((info) => {
      return Object.assign(info, {
        application: logType || logstashOption.application,
        hostname: logstashOption.hostname || os.hostname(),
        pid: process.pid,
        time: new Date(),
      });
    });

    return winston.createLogger({
      level: winstonOption.level || "info",
      format: winston.format.combine(
        appendMetaInfo(),
        winston.format.json(),
        winston.format.timestamp(),
      ),
      transports: [
        new LogstashTransport(logstashOption) as Transport
      ].concat(winstonOption.transports || [])
    });
  }
}

