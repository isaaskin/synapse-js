import { describe, expect, test, vi } from "vitest";
import { Logger, LogLevel } from "../src/logger";

describe("Logger", () => {
    test("log info when log level is info", () => {
        vi.spyOn(console, "log");
        const logger = new Logger("test");
        logger.log("test message", LogLevel.INFO);
        expect(console.log).toHaveBeenCalledWith("[test] [INFO] test message");
    });
});
