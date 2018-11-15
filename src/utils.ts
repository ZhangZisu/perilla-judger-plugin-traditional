import { closeSync, existsSync, fstatSync, openSync, readFileSync, readSync } from "fs-extra";
import { SandboxStatus } from "simple-sandbox/lib/interfaces";
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

export const convertStatus = (origin: SandboxStatus) => {
    switch (origin) {
        case SandboxStatus.Cancelled:
            return SolutionResult.JudgementFailed;
        case SandboxStatus.MemoryLimitExceeded:
            return SolutionResult.MemoryLimitExceeded;
        case SandboxStatus.OK:
            return SolutionResult.Accepted;
        case SandboxStatus.OutputLimitExceeded:
            return SolutionResult.RuntimeError;
        case SandboxStatus.RuntimeError:
            return SolutionResult.RuntimeError;
        case SandboxStatus.TimeLimitExceeded:
            return SolutionResult.TimeLimitExceeded;
        case SandboxStatus.Unknown:
            return SolutionResult.JudgementFailed;
    }
};
