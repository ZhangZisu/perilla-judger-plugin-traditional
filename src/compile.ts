import { copyFileSync, existsSync } from "fs";
import { emptyDirSync, ensureDirSync } from "fs-extra";
import { join } from "path";
import { startSandbox } from "simple-sandbox";
import { SandboxStatus } from "simple-sandbox/lib/interfaces";
import { cgroup, chroot, environments, tmpDir } from "./constants";
import { ILanguage } from "./interface";
import { shortRead } from "./utils";

const compileDir = join(tmpDir, "compile");
ensureDirSync(compileDir);
const mount = join(compileDir, "mount");
ensureDirSync(mount);
const safe = join(compileDir, "safe");
ensureDirSync(safe);

export const compile = async (file: string, lang: string) => {
    const language = require(join(__dirname, "languages", lang)) as ILanguage;
    emptyDirSync(mount);
    emptyDirSync(safe);
    copyFileSync(file, join(mount, language.compile.sourceFileName));
    const stdout = join(safe, "perilla_sb_stdout");
    const stderr = join(safe, "perilla_sb_stderr");
    const compileProcess = await startSandbox({
        cgroup,
        chroot,
        environments,
        executable: language.compile.executable,
        memory: language.compile.memoryLimit,
        time: language.compile.timeLimit,
        mountProc: true,
        mounts: [{ dst: "/root", limit: -1, src: mount }],
        parameters: language.compile.parameters,
        process: language.compile.processLimit,
        redirectBeforeChroot: true,
        stderr,
        stdout,
        user: "root",
        workingDirectory: "/root",
    });
    const compileResult = await compileProcess.waitForStop();
    const compileOutput = `${shortRead(stdout)}\n${shortRead(stdout)}`;
    const distFile = join(mount, language.compile.distFileName);
    if (compileResult.status === SandboxStatus.OK && existsSync(distFile)) {
        return distFile;
    }
    throw new Error(compileOutput);
};
