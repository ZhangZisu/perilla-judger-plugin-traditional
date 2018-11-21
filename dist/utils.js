"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const interface_1 = require("perilla-sandbox/dist/interface");
const interface_2 = require("./interface");
exports.shortRead = (file) => {
    if (!fs_extra_1.existsSync(file)) {
        return "File not found";
    }
    const fd = fs_extra_1.openSync(file, "r");
    const len = fs_extra_1.fstatSync(fd).size;
    if (len > 128) {
        const buf = Buffer.allocUnsafe(128);
        fs_extra_1.readSync(fd, buf, 0, 128, 0);
        const res = buf.toString() + "...";
        fs_extra_1.closeSync(fd);
        return res;
    }
    else {
        fs_extra_1.closeSync(fd);
        return fs_extra_1.readFileSync(file).toString();
    }
};
exports.convertStatus = (origin) => {
    switch (origin) {
        case interface_1.RunStatus.MemoryLimitExceeded:
            return interface_2.SolutionResult.MemoryLimitExceeded;
        case interface_1.RunStatus.Succeeded:
            return interface_2.SolutionResult.Accepted;
        case interface_1.RunStatus.RuntimeError:
            return interface_2.SolutionResult.RuntimeError;
        case interface_1.RunStatus.TimeLimitExceeded:
            return interface_2.SolutionResult.TimeLimitExceeded;
        case interface_1.RunStatus.Failed:
            return interface_2.SolutionResult.JudgementFailed;
    }
};
//# sourceMappingURL=utils.js.map