"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const c = {
    compile: {
        executable: "/usr/bin/env",
        memoryLimit: 512 * 1024,
        timeLimit: 3,
        processLimit: 5,
        arguments: ["gcc", "main.c", "-o", "main", "-Wall", "-O2"],
        sourceFileName: "main.c",
        distFileName: "main",
    },
    run: {
        executable: "main",
        filename: "main",
        arguments: [],
        processLimit: 1,
    },
};
module.exports = c;
//# sourceMappingURL=c.js.map