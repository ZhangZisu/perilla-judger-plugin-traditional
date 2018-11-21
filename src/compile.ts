import { existsSync } from "fs";
import { emptyDirSync, ensureDirSync } from "fs-extra";
import { join } from "path";
import { PerillaSandbox } from "perilla-sandbox";
import { RunStatus } from "perilla-sandbox/dist/interface";
import { tmpDir } from "./constants";
import { ILanguage } from "./interface";
import { shortRead } from "./utils";

const compileDir = join(tmpDir, "compile");
ensureDirSync(compileDir);

export const compile = (sandbox: PerillaSandbox, file: string, lang: string) => {
    const language = require(join(__dirname, "languages", lang)) as ILanguage;
    emptyDirSync(compileDir);
    const stdout = join(compileDir, "perilla_sb_stdout");
    const dist = join(compileDir, "perilla_dist");
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
    const compileOutput = shortRead(stdout);
    if (result.status === RunStatus.Succeeded && existsSync(dist)) {
        return dist;
    }
    throw new Error(compileOutput);
};
