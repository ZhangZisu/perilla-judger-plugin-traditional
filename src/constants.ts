import { join } from "path";

import { ensureDirSync } from "fs-extra";

export const chroot = join(__dirname, "..", "RootFS");
export const cgroup = "PERILLA";
export const environments = ["PATH=/usr/lib/jvm/java-1.8-openjdk/bin:/usr/share/Modules/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"];
export const tmpDir = "/tmp/perilla/judger/plugin/traditional";
ensureDirSync(tmpDir);
