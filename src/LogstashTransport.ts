import * as dgram from "dgram";
import * as net from "net";
import * as os from "os";
import * as winston from "winston";
import * as Transport from "winston-transport";
import * as logform from "logform"
import { LogstashOption } from "./LogstashOption";
import { disconnect } from "cluster";

export class LogstashTransport extends Transport {

  public readonly name = "LogstashTransport";
  protected host: string;
  protected port: number;
  protected protocol: "tcp" | "udp";
  protected udpClient: dgram.Socket;
  protected tcpClient: net.Socket;

  protected tcpKeepAliveInitialDelay: number = 0;

  constructor(options?: LogstashOption) {
    super(options);

    this.host = options.host;
    this.port = options.port;
    this.silent = options.silent;
    this.protocol = options.protocol || "udp"
    this.tcpKeepAliveInitialDelay = options.tcpKeepAliveInitialDelay || 0; 

    this.udpClient = null;
    this.tcpClient = null;
  }

  public connect() {
    if (this.protocol === "udp") {
      this.udpClient = dgram.createSocket("udp4");
      this.udpClient.unref();
    } else if (this.protocol === "tcp") {
      this.tcpClient = new net.Socket();
      this.tcpClient.connect(this.port, this.host);
      this.tcpClient.setKeepAlive(true, this.tcpKeepAliveInitialDelay)
      this.tcpClient.unref();
    } else {
      throw new Error("Invalid protocol, only support TCP and UDP.")
    }
  }

  public log(info: any, callback: Function) {
    if (this.silent) {
      return callback(null, true);
    }
    this.send(info[Symbol.for("message")], callback)
      .then((result) => {
        this.emit("logged", result);
      })
      .catch((err) => {
        callback(err, !err);
      })
  }

  public async send(message, callback) {
    return new Promise((resolve, reject) => {
      const transformed = JSON.stringify(this.format.transform(JSON.parse(message)));
      const buf = Buffer.from(transformed);

      if (this.protocol === "udp") {
        if (!this.udpClient) {
          this.connect();
        }
        this.udpClient.send(buf, 0, buf.length, this.port, this.host, (error, bytes) => {
          if (error) {
            reject(error)
          } else {
            resolve(bytes);
          }
          if (callback) {
            callback(error, bytes);
          }
        });
      } else {
        this.connect();
        this.tcpClient.write(transformed, (error) => {
          if (error) {
            this.tcpClient,disconnect();
            reject(error)
          } else {
            this.tcpClient,disconnect();
            resolve();
          }
          if (callback) {
            callback(error);
          }
        });
      }
    })
  }

  public static createLogger(logType: string, logstashOption: LogstashOption) {
    const appendMetaInfo = winston.format((info) => {
      return Object.assign(info, {
        application: logType || logstashOption.application,
        hostname: logstashOption.hostname || os.hostname(),
        pid: process.pid,
        time: new Date(),
      });
    });

    return winston.createLogger({
      level: logstashOption.level || "info",
      format: winston.format.combine(
        appendMetaInfo(),
        winston.format.json(),
        winston.format.timestamp(),
      ),
      transports: [
        new LogstashTransport(logstashOption) as Transport
      ].concat(logstashOption.transports || [])
    });
  }
}

