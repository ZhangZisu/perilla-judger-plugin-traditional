import { closeSync, existsSync, fstatSync, openSync, readFileSync, readSync } from "fs-extra";
import { RunStatus } from "perilla-sandbox/dist/interface";
import { SolutionResult } from "./interface";

export const shortRead = (file: string) => {
    if (!existsSync(file)) { return "File not found"; }
    const fd = openSync(file, "r");
    const len = fstatSync(fd).size;
    if (len > 128) {
        const buf = Buffer.allocUnsafe(128);
        readSync(fd, buf, 0, 128, 0);
        const res = buf.toString() + "...";
        closeSync(fd);
        return res;
    } else {
        closeSync(fd);
        return readFileSync(file).toString();
    }
};

export const convertStatus = (origin: RunStatus) => {
    switch (origin) {
        case RunStatus.MemoryLimitExceeded:
            return SolutionResult.MemoryLimitExceeded;
        case RunStatus.Succeeded:
            return SolutionResult.Accepted;
        case RunStatus.RuntimeError:
            return SolutionResult.RuntimeError;
        case RunStatus.TimeLimitExceeded:
            return SolutionResult.TimeLimitExceeded;
        case RunStatus.Failed:
            return SolutionResult.JudgementFailed;
    }
};
