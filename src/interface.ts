import { Array, Number, Partial, Record, String } from "runtypes";

export enum SolutionResult {
    WaitingJudge,            // Wating Judge
    Judging,                 // Judging
    Skipped,                 // Skipped
    Accepted,                // Accepted
    WrongAnswer,             // Wrong Answer
    TimeLimitExceeded,       // Time Limit Exceeded
    MemoryLimitExceeded,     // Memory Limit Exceeded
    RuntimeError,            // Runtime Error
    CompileError,            // Compile Error
    PresentationError,       // Presentation Error
    JudgementFailed,         // Judgement Failed (Judge program error)
    SystemError,             // System Error     (Judge framwork & Judge plugin error)
    OtherError,              // Other Error
}

export interface IFileModel {
    id: number;
    name: string;
    type: string;
    description: string;
    hash: string;
    size: number;
    created: Date;
    tags: string[];
    owner: string;
    creator: string;
}

export interface ISolution {
    status: SolutionResult;
    score: number;
    details?: IDetails;
}

export type JudgeFunction = (
    problem: object,
    solution: object,
    resolveFile: (id: number) => Promise<{ path: string, info: IFileModel }>,
    callback: (solution: ISolution) => Promise<void>,
) => Promise<void>;

export const RunCase = Record({
    input: Number,
    output: Number,
});

export const Subtask = Record({
    name: String,
    timeLimit: Number,
    memoryLimit: Number,
    score: Number,
    runcases: Array(RunCase),
    dependency: Array(String),
});

export const Problem = Record({
    subtasks: Array(Subtask),
}).And(Partial({
    spj: Record({
        file: Number,
        language: String,
    }),
}));

export const Solution = Record({
    file: Number,
    language: String,
});

export interface ILanguage {
    compile: {
        executable: string;
        memoryLimit: number;
        timeLimit: number;
        processLimit: number;
        arguments: string[];
        sourceFileName: string;
        distFileName: string;
    };
    run: {
        executable: string;
        filename: string;
        arguments: string[];
        processLimit: number;
    };
}

export interface IRunCaseResult {
    status: SolutionResult;
    score: number;
    input: string;
    output: string;
    answer: string;
    time: number;
    memory: number;
    log: string;
}

export interface ISubtaskResult {
    name: string;
    status: SolutionResult;
    score: number;
    runcases: IRunCaseResult[];
    time: number;
    memory: number;
}

export interface IDetails {
    subtasks?: ISubtaskResult[];
    time?: number;
    memory?: number;
    error?: string;
}
