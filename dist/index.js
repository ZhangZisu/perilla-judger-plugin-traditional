"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const perilla_sandbox_1 = require("perilla-sandbox");
const interface_1 = require("perilla-sandbox/dist/interface");
const compile_1 = require("./compile");
const constants_1 = require("./constants");
const interface_2 = require("./interface");
const run_1 = require("./run");
const utils_1 = require("./utils");
const mainDir = path_1.join(constants_1.tmpDir, "main");
fs_extra_1.ensureDirSync(mainDir);
const MAX_SPJ_OUTPUT_SIZE = 256;
let sandbox = null;
const config = JSON.parse(fs_extra_1.readFileSync(path_1.join(__dirname, "..", "config.json")).toString());
const main = async (problem, solution, resolveFile, cb) => {
    if (interface_2.Problem.guard(problem)) {
        if (interface_2.Solution.guard(solution)) {
            if (!sandbox) {
                sandbox = new perilla_sandbox_1.PerillaSandbox(config.isolateExecutable, config.boxID, 0, 1.1, 0, 1.1);
            }
            fs_extra_1.emptyDirSync(mainDir);
            let runSolution = null;
            let runJudger = null;
            let solutionFile = null;
            try {
                const solutionSource = await resolveFile(solution.file);
                solutionFile = solutionSource.path;
                const solutionExecTmpFile = compile_1.compile(sandbox, solutionSource.path, solution.language);
                const solutionExecFile = path_1.join(mainDir, "solution");
                fs_extra_1.copyFileSync(solutionExecTmpFile, solutionExecFile);
                runSolution = (stdin, extraFiles, timeLimit, memoryLimit) => {
                    return run_1.run(sandbox, solutionExecFile, solution.language, stdin, extraFiles, timeLimit, memoryLimit);
                };
            }
            catch (e) {
                return await cb({ status: interface_2.SolutionResult.CompileError, score: 0, details: { error: e.message } });
            }
            try {
                if (problem.spj) {
                    const judgerSource = await resolveFile(problem.spj.file);
                    const judgerExecTmpFile = compile_1.compile(sandbox, judgerSource.path, problem.spj.language);
                    const judgerExecFile = path_1.join(mainDir, "judger");
                    fs_extra_1.copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run_1.run(sandbox, judgerExecFile, problem.spj.language, stdin, extraFiles, timeLimit, memoryLimit);
                    };
                }
                else {
                    const judgerExecTmpFile = await compile_1.compile(sandbox, path_1.join(__dirname, "..", "resources", "compare.cpp"), "cpp11");
                    const judgerExecFile = path_1.join(mainDir, "judger");
                    fs_extra_1.copyFileSync(judgerExecTmpFile, judgerExecFile);
                    runJudger = (stdin, extraFiles, timeLimit, memoryLimit) => {
                        return run_1.run(sandbox, judgerExecFile, "cpp11", stdin, extraFiles, timeLimit, memoryLimit);
                    };
                }
            }
            catch (e) {
                return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: e.message } });
            }
            try {
                const subtasks = new Map();
                const degree = new Map();
                const queue = [];
                const order = [];
                let sum = 0;
                for (const subtask of problem.subtasks) {
                    subtasks.set(subtask.name, subtask);
                    sum += subtask.score;
                    for (const dep of subtask.dependency) {
                        if (!degree.has(dep)) {
                            degree.set(dep, 1);
                        }
                        else {
                            degree.set(dep, degree.get(dep) + 1);
                        }
                    }
                }
                if (sum !== 100) {
                    return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: "Sum of subtask scores is not 100!" } });
                }
                for (const [name] of subtasks) {
                    if (!degree.has(name) || !degree.get(name)) {
                        queue.push(name);
                    }
                }
                while (queue.length) {
                    const top = queue.shift();
                    order.unshift(top);
                    for (const dep of subtasks.get(top).dependency) {
                        let x = degree.get(dep);
                        if (--x <= 0) {
                            queue.push(dep);
                            degree.delete(dep);
                        }
                        else {
                            degree.set(dep, x);
                        }
                    }
                }
                if (order.length !== problem.subtasks.length) {
                    return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: "Topological sorting failed" } });
                }
                const results = new Map();
                const judgeResult = {
                    status: interface_2.SolutionResult.WaitingJudge,
                    score: 0,
                    details: {
                        subtasks: [],
                        time: 0,
                        memory: 0,
                    },
                };
                for (const name of order) {
                    let skip = false;
                    const subtask = subtasks.get(name);
                    for (const dep of subtask.dependency) {
                        const depres = results.get(dep);
                        if (depres.status !== interface_2.SolutionResult.Accepted || depres.score !== 100) {
                            skip = true;
                            break;
                        }
                    }
                    const result = {
                        name,
                        status: interface_2.SolutionResult.WaitingJudge,
                        score: 100,
                        runcases: [],
                        time: 0,
                        memory: 0,
                    };
                    if (skip) {
                        result.status = interface_2.SolutionResult.Skipped;
                        result.score = 0;
                    }
                    else {
                        for (const runcase of subtask.runcases) {
                            if (result.score === 0) {
                                break;
                            }
                            const input = await resolveFile(runcase.input);
                            const output = await resolveFile(runcase.output);
                            const userrun = runSolution(input.path, [], subtask.timeLimit, subtask.memoryLimit);
                            const caseResult = {
                                status: interface_2.SolutionResult.WaitingJudge,
                                score: 0,
                                input: utils_1.shortRead(input.path),
                                output: "",
                                answer: utils_1.shortRead(output.path),
                                time: userrun.result.time,
                                memory: userrun.result.memory,
                                log: "",
                            };
                            if (userrun.result.status !== interface_1.RunStatus.Succeeded) {
                                caseResult.status = utils_1.convertStatus(userrun.result.status);
                            }
                            else {
                                const userout = path_1.join(mainDir, "userout");
                                fs_extra_1.copyFileSync(userrun.stdout, userout);
                                caseResult.output = utils_1.shortRead(userout);
                                const judgerrun = runJudger(userout, [
                                    { src: input.path, dst: "input" },
                                    { src: output.path, dst: "output" },
                                    { src: solutionFile, dst: "usercode" },
                                ], subtask.timeLimit, subtask.memoryLimit);
                                if (userrun.result.status !== interface_1.RunStatus.Succeeded) {
                                    caseResult.status = interface_2.SolutionResult.JudgementFailed;
                                }
                                else {
                                    const fd = fs_extra_1.openSync(judgerrun.stdout, "r");
                                    const buf = Buffer.alloc(MAX_SPJ_OUTPUT_SIZE);
                                    fs_extra_1.readSync(fd, buf, 0, MAX_SPJ_OUTPUT_SIZE, 0);
                                    const tokens = buf.toString().split("\n");
                                    if (tokens.length < 2) {
                                        throw new Error("Invalid spj");
                                    }
                                    const status = parseInt(tokens[0], 10);
                                    if (!interface_2.SolutionResult[status]) {
                                        throw new Error("Invalid spj");
                                    }
                                    const score = parseInt(tokens[1], 10);
                                    if (score < 0 || score > 100) {
                                        throw new Error("Invalid spj");
                                    }
                                    caseResult.log = tokens[2] || "SPJ didn't provide any message";
                                    caseResult.status = status;
                                    caseResult.score = score;
                                    fs_extra_1.closeSync(fd);
                                }
                            }
                            if (result.status === interface_2.SolutionResult.WaitingJudge || result.status === interface_2.SolutionResult.Accepted) {
                                result.status = caseResult.status;
                            }
                            result.score = Math.min(result.score, caseResult.score);
                            result.runcases.push(caseResult);
                            result.time = Math.max(result.time, caseResult.time);
                            result.memory = Math.max(result.memory, caseResult.memory);
                        }
                    }
                    if (judgeResult.status === interface_2.SolutionResult.WaitingJudge || judgeResult.status === interface_2.SolutionResult.Accepted) {
                        judgeResult.status = result.status;
                    }
                    judgeResult.score += result.score / 100 * subtask.score;
                    judgeResult.details.subtasks.push(result);
                    judgeResult.details.time = Math.max(judgeResult.details.time, result.time);
                    judgeResult.details.memory = Math.max(judgeResult.details.memory, result.memory);
                    results.set(result.name, result);
                    await cb(judgeResult);
                }
                return await cb(judgeResult);
            }
            catch (e) {
                return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: e.message } });
            }
        }
        else {
            return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: "Invalid solution data" } });
        }
    }
    else {
        return await cb({ status: interface_2.SolutionResult.JudgementFailed, score: 0, details: { error: "Invalid problem data" } });
    }
};
module.exports = main;
//# sourceMappingURL=index.js.map