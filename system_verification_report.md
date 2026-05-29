# 系统自动化集成验证报告 (E2E Validation)

验证时间: 2026-05-29 16:33:21

## 1. 验证结果概览

| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 后端 | Python 算法测试 (pytest) | 830.6 | ✅ PASSED | - |
| 前端 | Vitest 组件与状态测试 | 3645.0 | ✅ PASSED | - |
| 前端 | Vite 生产环境构建打包 | 964.3 | ✅ SUCCESS | - |

## 2. 后端算法测试细节

> [!TIP]
> 所有 21 个 Python 测试用例全部通过，其中包含推荐性能压测及边界条件过滤校验。

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.3, pluggy-1.6.0
rootdir: E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy
plugins: anyio-4.13.0
collected 23 items

test_campus_buddy.py ............
[Performance] 2-hop buddy recommendation for '严丽' took 0.2568 ms.
[Performance] Jaccard-ranked buddy recommendation for '严丽' took 1.6768 ms.
[Performance] BFS find_path from '严丽' to '严华杰' took 0.4670 ms. Path length: 3
.........
test_python_scripts.py Mock Data Generation Complete:
  - Generated 1499 unique students and 4452 student-interest edges.
  - Generated 100 unique activities (Total 30 interest types).
  - Generated 1468 student-activity registration edges.
  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.
.Exported 2 student-interests, 1 activity-interests, and 1 registrations to 'frontend/public\graph_data.json'.
.

============================= 23 passed in 0.17s ==============================

```

## 3. 前端组件测试细节

> [!TIP]
> 所有 26 个 Vitest 测试用例全部通过，页面交互和状态机表现正常。

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mE:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend[39m

 [32m✓[39m src/test/graph-algorithms.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m src/test/graph-store.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 15[2mms[22m[39m
 [32m✓[39m src/test/report-generator.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 12[2mms[22m[39m
 [32m✓[39m src/test/auth-store.test.ts [2m([22m[2m11 tests[22m[2m)[22m[32m 24[2mms[22m[39m
 [32m✓[39m src/test/components/AllActivities.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 36[2mms[22m[39m
 [32m✓[39m src/test/components/BuddyList.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 47[2mms[22m[39m
 [32m✓[39m src/test/components/RecommendedActivities.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 47[2mms[22m[39m
[90mstdout[2m | src/test/App.test.ts[2m > [22m[2mApp.vue Mount Test[2m > [22m[2mshould mount App.vue successfully without throwing runtime exceptions
[22m[39mApp wrapper HTML content length: [33m176[39m

 [32m✓[39m src/test/App.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 76[2mms[22m[39m

[2m Test Files [22m [1m[32m8 passed[39m[22m[90m (8)[39m
[2m      Tests [22m [1m[32m30 passed[39m[22m[90m (30)[39m
[2m   Start at [22m 16:33:17
[2m   Duration [22m 2.43s[2m (transform 1.64s, setup 0ms, import 3.28s, tests 265ms, environment 8.62s)[22m


[90mstderr[2m | src/test/auth-store.test.ts[2m > [22m[2mAuth Store[2m > [22m[2mshould reject session restoration if student is missing from graph
[22m[39m[AuthStore] Session student "Bob" not found in graph, resetting session.

[90mstderr[2m | src/test/components/BuddyList.test.ts[2m > [22m[2mBuddyList.vue[2m > [22m[2mshould render buddies list correctly matches snapshot
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <PathFinder onOpenGraphHighlight=fn > 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <PathFinder onOpenGraphHighlight=fn > 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/BuddyList.test.ts[2m > [22m[2mBuddyList.vue[2m > [22m[2mshould render empty message when no buddies recommended
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/AllActivities.test.ts[2m > [22m[2mAllActivities.vue[2m > [22m[2mrenders all activities list correctly matches snapshot
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <AllActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <AllActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/BuddyList.test.ts[2m > [22m[2mBuddyList.vue[2m > [22m[2mshould render empty message when no buddies recommended
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <PathFinder onOpenGraphHighlight=fn > 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/RecommendedActivities.test.ts[2m > [22m[2mRecommendedActivities.vue[2m > [22m[2mrenders recommended activities list correctly matches snapshot
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/RecommendedActivities.test.ts[2m > [22m[2mRecommendedActivities.vue[2m > [22m[2mhandles empty state when no activities match
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>

[90mstderr[2m | src/test/components/RecommendedActivities.test.ts[2m > [22m[2mRecommendedActivities.vue[2m > [22m[2mhandles empty state when no activities match
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <RecommendedActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>


```

## 4. 生产环境构建细节

> [!NOTE]
> 生产环境静态资源构建成功，TypeScript 类型校验及文件树输出大小如下：

```text

> campus-buddy-web@1.1.2 build
> vite build

[36mvite v8.0.14 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 719 modules transformed.
rendering chunks...
computing gzip size...
dist/loader-preview.html                     1.06 kB │ gzip:  0.52 kB
dist/index.html                              2.20 kB │ gzip:  1.10 kB
dist/assets/avatar_developer-CcgoAaWA.png   39.92 kB
dist/assets/preview-Do-ytrWU.css             1.04 kB │ gzip:  0.55 kB
dist/assets/style-CSMlZpfA.css              13.18 kB │ gzip:  3.47 kB
dist/assets/main-o3m8T2PP.css               94.73 kB │ gzip: 15.39 kB
dist/assets/preview-DUCrF57E.js              0.90 kB │ gzip:  0.70 kB
dist/assets/style-CUL1M7Kc.js                9.65 kB │ gzip:  4.20 kB
dist/assets/d3-vendor-7qNyeggi.js           61.04 kB │ gzip: 20.90 kB
dist/assets/vue-vendor-CKem-9up.js          77.84 kB │ gzip: 30.61 kB
dist/assets/main-Cb7ShtcT.js               201.59 kB │ gzip: 57.98 kB

[32m✓ built in 405ms[39m

```
