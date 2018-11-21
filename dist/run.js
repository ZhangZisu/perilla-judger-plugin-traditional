"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const constants_1 = require("./constants");
const runDir = path_1.join(constants_1.tmpDir, "run");
fs_extra_1.ensureDirSync(runDir);
const MAX_MEMORY_LIMIT = 4096 * 1024;
const MAX_TIME_LIMIT = 10;
exports.run = (sandbox, file, lang, stdin, extraFiles, timeLimit, memoryLimit) => {
    const language = require(path_1.join(__dirname, "languages", lang));
    fs_extra_1.emptyDirSync(runDir);
    const inputFiles = extraFiles.concat({ src: file, dst: language.run.filename });
    const stdout = path_1.join(runDir, "perilla_stdout");
    const result = sandbox.run({
        executable: language.run.executable,
        memory: Math.min(MAX_MEMORY_LIMIT, memoryLimit),
        time: Math.min(MAX_TIME_LIMIT, timeLimit),
        processes: language.run.processLimit,
        shareNet: false,
        inputFiles,
        outputFiles: [],
        stdin,
        stdout,
        arguments: language.run.arguments,
    });
    return { result, stdout };
};
//# sourceMappingURL=run.js.map