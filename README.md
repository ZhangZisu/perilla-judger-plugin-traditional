# perilla-judger-plugin-traditional
[![](https://img.shields.io/badge/project-Perilla-8e44ad.svg?style=flat-square)](https://github.com/ZhangZisu/perilla)

Judge plugin for perilla tradition problems(spj supported)

# Setup guide

This plugin uses [perilla-sandbox](https://github.com/ZhangZisu/perilla-sandbox).
So you need to install [ioi's isolate](https://github.com/ioi/isolate) first.

# Problem format
**Please remove the comments in your data config!**
**在实际的题目数据配置中请勿保留注释！**
```jsonc
{
    "subtasks": [
        {
            "name": "Default",        // 子任务名 subtaskname
            "timeLimit": 1,           // 时间限制，单位秒，可以为浮点数 time limit in seconds can be float
            "memoryLimit": 524288,    // 空间限制，单位KB，可以为浮点数 memory limit in KB can be float
            "score": 100,             // 子任务分值，需要确保所有子任务分值和为100 subtask score make sure sum = 100
            "runcases": [             // 测试点 runcases
                {
                    "input": 3912,    // 测试点输入文件编号 input file NO.
                    "output": 3913,   // 测试点输出文件编号 output file NO.
                    "desc": "euclid3" // 测试点描述（可选）description
                }
            ],
            "dependency": [           // 依赖子任务 dependency
                "Example"             // 依赖子任务名 注意：和定义顺序无关 dependency subtask name
            ]
        },
        {
            "name": "Example",
            "timeLimit": 0.1,
            "memoryLimit": 16,
            "score": 0,
            "runcases": [],
            "dependency": []
        }
    ]
}
```

# Notice

A `public class Main` with main function is required for every java code.
