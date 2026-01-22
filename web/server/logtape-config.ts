import { getFileSink } from "@logtape/file";
import { configure, getStreamSink, LogLevel } from "@logtape/logtape";

export function configureLogtape(logFile: string, logLevel: LogLevel) {
  return configure({
    sinks: {
      file: getFileSink(logFile),
      stderr: getStreamSink(Deno.stderr.writable),
    },
    loggers: [
      { category: "server", lowestLevel: logLevel, sinks: ["file"] },
      { category: ["logtape", "meta"], sinks: ["stderr"] },
    ],
  });
}
