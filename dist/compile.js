"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const interface_1 = require("perilla-sandbox/dist/interface");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const compileDir = path_1.join(constants_1.tmpDir, "compile");
fs_extra_1.ensureDirSync(compileDir);
exports.compile = (sandbox, file, lang) => {
    const language = require(path_1.join(__dirname, "languages", lang));
    fs_extra_1.emptyDirSync(compileDir);
    const stdout = path_1.join(compileDir, "perilla_sb_stdout");
    const dist = path_1.join(compileDir, "perilla_dist");
    const result = sandbox.run({
        executable: language.compile.executable,
        memory: language.compile.memoryLimit,
        time: language.compile.timeLimit,
        processes: language.compile.processLimit,
        shareNet: false,
        inputFiles: [{
                src: file,
                dst: language.compile.sourceFileName,
            }],
        outputFiles: [
            {
                src: language.compile.distFileName,
                dst: dist,
            },
        ],
        stdout,
        arguments: language.compile.arguments,
    });
    const compileOutput = utils_1.shortRead(stdout);
    if (result.status === interface_1.RunStatus.Succeeded && fs_1.existsSync(dist)) {
        return dist;
    }
    throw new Error(compileOutput);
};
//# sourceMappingURL=compile.js.map