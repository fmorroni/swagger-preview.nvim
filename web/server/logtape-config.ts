import { getFileSink } from "@logtape/file";
import { configure, getConsoleSink, getStreamSink, LogLevel } from "@logtape/logtape";

export function configureLogtape(logFile: string, logLevel: LogLevel) {
  return configure({
    sinks: {
      file: getFileSink(logFile),
      console: getConsoleSink(),
      stderr: getStreamSink(Deno.stderr.writable),
    },
    loggers: [
      { category: "server", lowestLevel: logLevel, sinks: ["file", "console"] },
      { category: ["logtape", "meta"], sinks: ["stderr"] },
    ],
  });
}
