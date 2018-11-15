import { copyFileSync, emptyDirSync, ensureDirSync } from "fs-extra";
import { join } from "path";
import { startSandbox } from "simple-sandbox";
import { cgroup, chroot, environments, tmpDir } from "./constants";
import { ILanguage } from "./interface";

const runDir = join(tmpDir, "run");
ensureDirSync(runDir);
const mount = join(runDir, "mount");
ensureDirSync(mount);
const safe = join(runDir, "safe");
ensureDirSync(safe);

// 4GB
const MAX_MEMORY_LIMIT = 4096 * 1024 * 1024;
// 10s
const MAX_TIME_LIMIT = 10 * 1000;

export const run = async (file: string, lang: string, stdin: string, extraFiles: Array<{ src: string, dst: string }>, timeLimit: number, memoryLimit: number) => {
    const language = require(join(__dirname, "languages", lang)) as ILanguage;
    emptyDirSync(mount);
    emptyDirSync(safe);

    copyFileSync(file, join(mount, language.run.filename));
    for (const extrafile of extraFiles) {
        copyFileSync(extrafile.src, join(mount, extrafile.dst));
    }
    const stdout = join(safe, "perilla_stdout");
    const runProcess = await startSandbox({
        cgroup,
        chroot,
        environments,
        executable: language.run.executable,
        memory: Math.min(MAX_MEMORY_LIMIT, memoryLimit),
        time: Math.min(MAX_TIME_LIMIT, timeLimit),
        mountProc: true,
        mounts: [{ dst: "/root", limit: -1, src: mount }],
        parameters: language.run.parameters,
        process: language.run.processLimit,
        redirectBeforeChroot: true,
        stdin,
        stdout,
        user: "root",
        workingDirectory: "/root",
    });
    const result = await runProcess.waitForStop();
    return { result, stdout };
};
