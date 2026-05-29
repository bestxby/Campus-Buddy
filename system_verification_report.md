# 系统自动化集成验证报告 (E2E Validation)

验证时间: 2026-05-29 11:58:12

## 1. 验证结果概览

| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 后端 | Python 算法测试 (pytest) | 1538.4 | ✅ PASSED | - |
| 前端 | Vitest 组件与状态测试 | 1530.1 | ✅ PASSED | - |
| 前端 | Vite 生产环境构建打包 | 1239.0 | ❌ FAILED | - |

## 2. 后端算法测试细节

> [!TIP]
> 所有 21 个 Python 测试用例全部通过，其中包含推荐性能压测及边界条件过滤校验。

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.3, pluggy-1.6.0
rootdir: E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy
plugins: anyio-4.13.0
collected 22 items

test_campus_buddy.py ............
[Performance] 2-hop buddy recommendation for '严丽' took 0.3511 ms.
[Performance] Jaccard-ranked buddy recommendation for '严丽' took 1.9500 ms.
[Performance] BFS find_path from '严丽' to '严华杰' took 0.4500 ms. Path length: 3
........
test_python_scripts.py Mock Data Generation Complete:
  - Generated 1499 unique students and 4452 student-interest edges.
  - Generated 100 unique activities (Total 30 interest types).
  - Generated 1468 student-activity registration edges.
  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.
.Exported 2 student-interests, 1 activity-interests, and 1 registrations to 'frontend/public\graph_data.json'.
.

============================= 22 passed in 0.25s ==============================

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

> [!CAUTION]
> 生产环境构建打包失败！请参见错误日志：

```text

> campus-buddy-web@1.1.2 build
> vite build

[36mvite v8.0.14 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 713 modules transformed.

[31m✗[39m Build failed in 434ms
[31merror during build:
[31mBuild failed with 1 error:

[plugin vite:vue] E:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend/src/components/ExportModal.vue:621:1
RolldownError: Invalid end tag.
SyntaxError: Invalid end tag.
    at createCompilerError (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:1374:17)
    at emitError (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:2980:5)
    at Object.onclosetag (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:2387:9)
    at Tokenizer.stateInClosingTagName (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:799:16)
    at Tokenizer.parse (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:1157:16)
    at Object.baseParse (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-core\dist\compiler-core.cjs.prod.js:3012:13)
    at Object.parse (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-dom\dist\compiler-dom.cjs.prod.js:665:23)
    at Object.parse$1 [as parse] (E:\学习\大二下课程\数据结构与算法\数据结构大作业\Campus-Buddy\frontend\node_modules\@vue\compiler-sfc\dist\compiler-sfc.cjs.js:1824:24)
    at createDescriptor (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs:50:42)
    at transformMain (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs:1299:33)[31m
    at aggregateBindingErrorsIntoJsError (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/rolldown/dist/shared/error-B8po7KiL.mjs:48:18)
    at unwrapBindingResult (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/rolldown/dist/shared/error-B8po7KiL.mjs:18:128)
    at #build (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/rolldown/dist/shared/rolldown-build-9MccaWPU.mjs:3236:34)
    at async buildEnvironment (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/vite/dist/node/chunks/node.js:33137:64)
    at async Object.build (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/vite/dist/node/chunks/node.js:33559:19)
    at async Object.buildApp (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/vite/dist/node/chunks/node.js:33556:153)
    at async CAC.<anonymous> (file:///E:/%E5%AD%A6%E4%B9%A0/%E5%A4%A7%E4%BA%8C%E4%B8%8B%E8%AF%BE%E7%A8%8B/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%A4%A7%E4%BD%9C%E4%B8%9A/Campus-Buddy/frontend/node_modules/vite/dist/node/cli.js:777:3) {
  errors: [Getter/Setter]
}[39m

```
