import { copyFileSync, emptyDirSync, ensureDirSync } from "fs-extra";
import { join } from "path";
import { PerillaSandbox } from "perilla-sandbox";
import { tmpDir } from "./constants";
import { ILanguage } from "./interface";

const runDir = join(tmpDir, "run");
ensureDirSync(runDir);

// 4GB
const MAX_MEMORY_LIMIT = 4096 * 1024;
// 10s
const MAX_TIME_LIMIT = 10;

export const run = (sandbox: PerillaSandbox, file: string, lang: string, stdin: string, extraFiles: Array<{ src: string, dst: string }>, timeLimit: number, memoryLimit: number) => {
    const language = require(join(__dirname, "languages", lang)) as ILanguage;
    emptyDirSync(runDir);

    const inputFiles = extraFiles.concat({src: file, dst: language.run.filename});
    const stdout = join(runDir, "perilla_stdout");
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
