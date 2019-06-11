import { LoggerOptions } from "winston";

export interface LogstashOption extends LoggerOptions {
  application?: string;
  hostname?: string;
  host: string;
  port: number;
  trailingLineFeed?: boolean;
  trailingLineFeedChar?: string;
}