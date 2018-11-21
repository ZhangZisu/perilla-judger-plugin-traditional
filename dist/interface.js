"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtypes_1 = require("runtypes");
var SolutionResult;
(function (SolutionResult) {
    SolutionResult[SolutionResult["WaitingJudge"] = 0] = "WaitingJudge";
    SolutionResult[SolutionResult["Judging"] = 1] = "Judging";
    SolutionResult[SolutionResult["Skipped"] = 2] = "Skipped";
    SolutionResult[SolutionResult["Accepted"] = 3] = "Accepted";
    SolutionResult[SolutionResult["WrongAnswer"] = 4] = "WrongAnswer";
    SolutionResult[SolutionResult["TimeLimitExceeded"] = 5] = "TimeLimitExceeded";
    SolutionResult[SolutionResult["MemoryLimitExceeded"] = 6] = "MemoryLimitExceeded";
    SolutionResult[SolutionResult["RuntimeError"] = 7] = "RuntimeError";
    SolutionResult[SolutionResult["CompileError"] = 8] = "CompileError";
    SolutionResult[SolutionResult["PresentationError"] = 9] = "PresentationError";
    SolutionResult[SolutionResult["JudgementFailed"] = 10] = "JudgementFailed";
    SolutionResult[SolutionResult["SystemError"] = 11] = "SystemError";
    SolutionResult[SolutionResult["OtherError"] = 12] = "OtherError";
})(SolutionResult = exports.SolutionResult || (exports.SolutionResult = {}));
exports.RunCase = runtypes_1.Record({
    input: runtypes_1.Number,
    output: runtypes_1.Number,
});
exports.Subtask = runtypes_1.Record({
    name: runtypes_1.String,
    timeLimit: runtypes_1.Number,
    memoryLimit: runtypes_1.Number,
    score: runtypes_1.Number,
    runcases: runtypes_1.Array(exports.RunCase),
    dependency: runtypes_1.Array(runtypes_1.String),
});
exports.Problem = runtypes_1.Record({
    subtasks: runtypes_1.Array(exports.Subtask),
}).And(runtypes_1.Partial({
    spj: runtypes_1.Record({
        file: runtypes_1.Number,
        language: runtypes_1.String,
    }),
}));
exports.Solution = runtypes_1.Record({
    file: runtypes_1.Number,
    language: runtypes_1.String,
});
//# sourceMappingURL=interface.js.map