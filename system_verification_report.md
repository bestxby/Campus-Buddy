# 系统自动化集成验证报告 (E2E Validation)

验证时间: 2026-05-30 16:20:53

## 1. 验证结果概览

| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 后端 | Python 算法测试 (pytest) | 689.3 | ✅ PASSED | - |
| 前端 | Vitest 组件与状态测试 | 3639.2 | ✅ PASSED | - |
| 前端 | Vite 生产环境构建打包 | 883.6 | ✅ SUCCESS | - |

## 2. 后端算法测试细节

> [!TIP]
> 所有 23 个 Python 测试用例全部通过，其中包含推荐性能压测及边界条件过滤校验。

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.3, pluggy-1.6.0
rootdir: E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy
plugins: anyio-4.13.0
collected 23 items

test_campus_buddy.py ............
[Performance] 2-hop buddy recommendation for '严丽' took 0.2233 ms.
[Performance] Jaccard-ranked buddy recommendation for '严丽' took 2.5280 ms.
[Performance] BFS find_path from '严丽' to '严华杰' took 0.3750 ms. Path length: 3
.........
test_python_scripts.py Mock Data Generation Complete:
  - Generated 1499 unique students and 4452 student-interest edges.
  - Generated 100 unique activities (Total 30 interest types).
  - Generated 1468 student-activity registration edges.
  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.
.Exported 2 student-interests, 1 activity-interests, and 1 registrations to 'frontend/public\graph_data.json'.
.

============================= 23 passed in 0.15s ==============================

```

## 3. 前端组件测试细节

> [!TIP]
> 所有 70 个 Vitest 测试用例全部通过，页面交互和状态机表现正常。

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mE:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend[39m

 [32m✓[39m src/test/graph-algorithms.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 7[2mms[22m[39m
 [32m✓[39m src/test/auth-helpers.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 6[2mms[22m[39m
 [32m✓[39m src/test/components/GraphFilterControls.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 50[2mms[22m[39m
 [32m✓[39m src/test/components/GraphZoomControls.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m src/test/graph-store.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 14[2mms[22m[39m
 [32m✓[39m src/test/auth-store.test.ts [2m([22m[2m14 tests[22m[2m)[22m[32m 24[2mms[22m[39m
 [32m✓[39m src/test/report-generator.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 11[2mms[22m[39m
 [32m✓[39m src/test/useRecommendations.test.ts [2m([22m[2m11 tests[22m[2m)[22m[32m 24[2mms[22m[39m
 [32m✓[39m src/test/components/AllActivities.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 50[2mms[22m[39m
 [32m✓[39m src/test/components/RecommendedActivities.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 52[2mms[22m[39m
 [32m✓[39m src/test/components/BuddyList.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 72[2mms[22m[39m
 [32m✓[39m src/test/force-graph-renderer.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 16[2mms[22m[39m
[90mstdout[2m | src/test/App.test.ts[2m > [22m[2mApp.vue Mount Test[2m > [22m[2mshould mount App.vue successfully without throwing runtime exceptions
[22m[39mApp wrapper HTML content length: [33m176[39m

 [32m✓[39m src/test/App.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 48[2mms[22m[39m

[2m Test Files [22m [1m[32m13 passed[39m[22m[90m (13)[39m
[2m      Tests [22m [1m[32m70 passed[39m[22m[90m (70)[39m
[2m   Start at [22m 16:20:49
[2m   Duration [22m 2.65s[2m (transform 2.77s, setup 231ms, import 5.58s, tests 412ms, environment 17.51s)[22m


[90mstderr[2m | src/test/auth-store.test.ts[2m > [22m[2mAuth Store[2m > [22m[2mshould reject session restoration if student is missing from graph
[22m[39m[AuthStore] Session student "Bob" not found in graph, resetting session.


```

## 4. 生产环境构建细节

> [!NOTE]
> 生产环境静态资源构建成功，TypeScript 类型校验及文件树输出大小如下：

```text

> campus-buddy-web@3.0.0 build
> vite build

[36mvite v8.0.14 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 730 modules transformed.
rendering chunks...
computing gzip size...
dist/loader-preview.html                     1.06 kB │ gzip:  0.52 kB
dist/index.html                              3.40 kB │ gzip:  1.49 kB
dist/assets/avatar_developer-CcgoAaWA.png   39.92 kB
dist/assets/preview-q0-W21rO.css             1.08 kB │ gzip:  0.55 kB
dist/assets/style-DwMoQK8u.css              20.93 kB │ gzip:  4.99 kB
dist/assets/main-D_uquFRH.css              125.70 kB │ gzip: 17.21 kB
dist/assets/preview-C6nol45h.js              0.90 kB │ gzip:  0.71 kB
dist/assets/style-2WoOui6e.js                9.92 kB │ gzip:  4.33 kB
dist/assets/d3-vendor-CSNoqnqE.js           61.05 kB │ gzip: 20.91 kB
dist/assets/vue-vendor-SI8RVhHu.js          80.35 kB │ gzip: 31.62 kB
dist/assets/main-JmhSDbyG.js               239.92 kB │ gzip: 66.31 kB

[32m✓ built in 381ms[39m

```
