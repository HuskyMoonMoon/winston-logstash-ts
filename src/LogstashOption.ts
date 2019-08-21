import { LoggerOptions } from "winston";

export interface LogstashOption extends LoggerOptions {
  application?: string;
  hostname?: string;
  protocol?: "tcp" | "udp";
  host: string;
  port: number;
  tcpKeepAliveInitialDelay?: number;
}