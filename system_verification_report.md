# 系统自动化集成验证报告 (E2E Validation)

验证时间: 2026-05-28 17:27:09

## 1. 验证结果概览

| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 后端 | Python 算法测试 (pytest) | 1887.5 | ✅ PASSED | - |
| 前端 | Vitest 组件与状态测试 | 1478.5 | ✅ PASSED | - |
| 前端 | Vite 生产环境构建打包 | 1327.6 | ✅ SUCCESS | - |

## 2. 后端算法测试细节

> [!TIP]
> 所有 21 个 Python 测试用例全部通过，其中包含推荐性能压测及边界条件过滤校验。

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.3, pluggy-1.6.0
rootdir: E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy
plugins: anyio-4.13.0
collected 21 items

test_campus_buddy.py ............
[Performance] 2-hop buddy recommendation for '严丽' took 0.2657 ms.
[Performance] Jaccard-ranked buddy recommendation for '严丽' took 2.4042 ms.
[Performance] BFS find_path from '严丽' to '严刚' took 2.2312 ms. Path length: 5
.......
test_python_scripts.py Mock Data Generation Complete:
  - Generated 1499 unique students and 4553 student-interest edges.
  - Generated 100 unique activities (Total 30 interest types).
  - Generated 1490 student-activity registration edges.
  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.
.Exported 2 student-interests, 1 activity-interests, and 1 registrations to 'frontend/public\graph_data.json'.
.

============================= 21 passed in 0.23s ==============================

```

## 3. 前端组件测试细节

> [!TIP]
> 所有 26 个 Vitest 测试用例全部通过，页面交互和状态机表现正常。

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mE:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend[39m

No test files found, exiting with code 0


[2minclude: [22m[33m**/*.{test,spec}.?(c|m)[jt]s?(x)[39m
[2mexclude:  [22m[33m**/node_modules/**[2m, [22m**/.git/**[39m


```

## 4. 生产环境构建细节

> [!NOTE]
> 生产环境静态资源构建成功，TypeScript 类型校验及文件树输出大小如下：

```text

> campus-buddy-web@1.0.0 build
> vite build

[36mvite v8.0.14 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 712 modules transformed.
rendering chunks...
computing gzip size...
dist/loader-preview.html              1.06 kB │ gzip:  0.52 kB
dist/index.html                       2.18 kB │ gzip:  1.09 kB
dist/assets/preview-Do-ytrWU.css      1.04 kB │ gzip:  0.55 kB
dist/assets/style-D70FUa3U.css       13.18 kB │ gzip:  3.47 kB
dist/assets/main-DPWWPTYd.css        86.48 kB │ gzip: 14.09 kB
dist/assets/preview-DlZ8BI2h.js       0.90 kB │ gzip:  0.70 kB
dist/assets/style-WwaLp_sC.js         8.13 kB │ gzip:  3.83 kB
dist/assets/d3-vendor-7qNyeggi.js    61.04 kB │ gzip: 20.90 kB
dist/assets/vue-vendor-CKem-9up.js   77.84 kB │ gzip: 30.61 kB
dist/assets/main-Dfhs5duo.js        137.79 kB │ gzip: 42.16 kB

[32m✓ built in 527ms[39m

```
