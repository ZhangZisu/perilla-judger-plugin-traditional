import { ILanguage } from "../interface";

const lua: ILanguage = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 1,
        arguments: ["echo", "Lua programs are not forced to be compiled"],
        sourceFileName: "main.lua",
        distFileName: "main.lua",
    },
    run: {
        executable: "/usr/bin/env",
        filename: "main.lua",
        arguments: ["lua5.3", "main.lua"],
        processLimit: 5,
    },
};

module.exports = lua;
