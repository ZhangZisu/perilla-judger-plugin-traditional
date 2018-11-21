import { dirSync } from "tmp";

const tmp = dirSync();

export const tmpDir = tmp.name;
