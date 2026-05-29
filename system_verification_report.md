# 系统自动化集成验证报告 (E2E Validation)

验证时间: 2026-05-29 15:41:10

## 1. 验证结果概览

| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 后端 | Python 算法测试 (pytest) | 891.5 | ✅ PASSED | - |
| 前端 | Vitest 组件与状态测试 | 4110.6 | ✅ PASSED | - |
| 前端 | Vite 生产环境构建打包 | 1086.6 | ✅ SUCCESS | - |

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
[Performance] 2-hop buddy recommendation for '严丽' took 0.2214 ms.
[Performance] Jaccard-ranked buddy recommendation for '严丽' took 1.2714 ms.
[Performance] BFS find_path from '严丽' to '严华杰' took 0.3760 ms. Path length: 3
.........
test_python_scripts.py Mock Data Generation Complete:
  - Generated 1499 unique students and 4452 student-interest edges.
  - Generated 100 unique activities (Total 30 interest types).
  - Generated 1468 student-activity registration edges.
  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.
.Exported 2 student-interests, 1 activity-interests, and 1 registrations to 'frontend/public\graph_data.json'.
.

============================= 23 passed in 0.14s ==============================

```

## 3. 前端组件测试细节

> [!TIP]
> 所有 26 个 Vitest 测试用例全部通过，页面交互和状态机表现正常。

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mE:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend[39m

 [32m✓[39m src/test/graph-algorithms.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m src/test/graph-store.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 10[2mms[22m[39m
 [32m✓[39m src/test/auth-store.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 18[2mms[22m[39m
 [32m✓[39m src/test/components/AllActivities.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 38[2mms[22m[39m
 [32m✓[39m src/test/components/RecommendedActivities.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 45[2mms[22m[39m
 [32m✓[39m src/test/components/BuddyList.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 48[2mms[22m[39m
[90mstdout[2m | src/test/App.test.ts[2m > [22m[2mApp.vue Mount Test[2m > [22m[2mshould mount App.vue successfully without throwing runtime exceptions
[22m[39mApp wrapper HTML content length: [33m176[39m

 [32m✓[39m src/test/App.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 69[2mms[22m[39m

[2m Test Files [22m [1m[32m7 passed[39m[22m[90m (7)[39m
[2m      Tests [22m [1m[32m22 passed[39m[22m[90m (22)[39m
[2m   Start at [22m 15:41:06
[2m   Duration [22m 2.66s[2m (transform 1.51s, setup 0ms, import 2.97s, tests 237ms, environment 8.95s)[22m


[90mstderr[2m | src/test/components/AllActivities.test.ts[2m > [22m[2mAllActivities.vue[2m > [22m[2mrenders all activities list correctly matches snapshot
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <AllActivities ref="VTU_COMPONENT" > 
  at <VTUROOT>
[Vue warn]: injection "Symbol(pinia)" not found. 
  at <AllActivities ref="VTU_COMPONENT" > 
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

[90mstderr[2m | src/test/components/BuddyList.test.ts[2m > [22m[2mBuddyList.vue[2m > [22m[2mshould render empty message when no buddies recommended
[22m[39m[Vue warn]: injection "Symbol(pinia)" not found. 
  at <PathFinder onOpenGraphHighlight=fn > 
  at <BuddyList ref="VTU_COMPONENT" > 
  at <VTUROOT>


```

## 4. 生产环境构建细节

> [!NOTE]
> 生产环境静态资源构建成功，TypeScript 类型校验及文件树输出大小如下：

```text

> campus-buddy-web@1.1.2 build
> vite build

[36mvite v8.0.14 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 718 modules transformed.
rendering chunks...
computing gzip size...
dist/loader-preview.html              1.06 kB │ gzip:  0.52 kB
dist/index.html                       2.20 kB │ gzip:  1.10 kB
dist/assets/preview-Do-ytrWU.css      1.04 kB │ gzip:  0.55 kB
dist/assets/style-CSMlZpfA.css       13.18 kB │ gzip:  3.47 kB
dist/assets/main-bD8U-_3W.css        94.73 kB │ gzip: 15.38 kB
dist/assets/preview-DUCrF57E.js       0.90 kB │ gzip:  0.70 kB
dist/assets/style-CUL1M7Kc.js         9.65 kB │ gzip:  4.20 kB
dist/assets/d3-vendor-7qNyeggi.js    61.04 kB │ gzip: 20.90 kB
dist/assets/vue-vendor-CKem-9up.js   77.84 kB │ gzip: 30.61 kB
dist/assets/main-BL-z4ocX.js        198.25 kB │ gzip: 57.55 kB

[32m✓ built in 512ms[39m

```
