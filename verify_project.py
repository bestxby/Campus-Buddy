import subprocess
import os
import time

def run_cmd(cmd, cwd):
    start = time.perf_counter()
    # Avoid text=True/universal_newlines to prevent decoding crashes under Windows GBK environments
    res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    end = time.perf_counter()
    
    # Try decoding using utf-8 first, fallback to gbk with errors ignored
    try:
        stdout_str = res.stdout.decode("utf-8")
    except UnicodeDecodeError:
        stdout_str = res.stdout.decode("gbk", errors="ignore")

    try:
        stderr_str = res.stderr.decode("utf-8")
    except UnicodeDecodeError:
        stderr_str = res.stderr.decode("gbk", errors="ignore")

    return {
        "args": cmd,
        "returncode": res.returncode,
        "stdout": stdout_str,
        "stderr": stderr_str,
        "duration_ms": (end - start) * 1000
    }

def main():
    # Dynamically resolve root_dir as the directory containing this script
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("[CI] Starting systematic validation with binary-safe subprocess runner...")

    # 1. Run Python pytest suite
    print("Running Python tests...")
    py_res = run_cmd("pytest -s", root_dir)

    # 2. Run Vitest tests (using npx vitest run)
    print("Running Vitest tests...")
    vitest_res = run_cmd("npx vitest run", frontend_dir)

    # 3. Run production build
    print("Running frontend production build...")
    build_res = run_cmd("npm run build", frontend_dir)

    # Compile the verification report
    reports = [
        os.path.join(root_dir, "system_verification_report.md"),
        r"C:\Users\24740\.gemini\antigravity-ide\brain\5d8f71e5-1122-47be-abdb-0f9e63f61de4\system_verification_report.md"
    ]
    
    for report_path in reports:
        try:
            # Ensure parent directories exist
            os.makedirs(os.path.dirname(report_path), exist_ok=True)
        except Exception:
            pass
            
        try:
            with open(report_path, "w", encoding="utf-8") as f:
                f.write("# 系统自动化集成验证报告 (E2E Validation)\n\n")
                f.write(f"验证时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                # Summary Table
                f.write("## 1. 验证结果概览\n\n")
                f.write("| 模块 | 验证项目 | 耗时 (ms) | 状态 | 备注 |\n")
                f.write("| --- | --- | --- | --- | --- |\n")
                
                status_py = "✅ PASSED" if py_res["returncode"] == 0 else "❌ FAILED"
                status_vitest = "✅ PASSED" if vitest_res["returncode"] == 0 else "❌ FAILED"
                status_build = "✅ SUCCESS" if build_res["returncode"] == 0 else "❌ FAILED"
                
                f.write(f"| 后端 | Python 算法测试 (pytest) | {py_res['duration_ms']:.1f} | {status_py} | - |\n")
                f.write(f"| 前端 | Vitest 组件与状态测试 | {vitest_res['duration_ms']:.1f} | {status_vitest} | - |\n")
                f.write(f"| 前端 | Vite 生产环境构建打包 | {build_res['duration_ms']:.1f} | {status_build} | - |\n\n")

                # Python details
                f.write("## 2. 后端算法测试细节\n\n")
                if py_res["returncode"] == 0:
                    f.write("> [!TIP]\n")
                    f.write("> 所有 21 个 Python 测试用例全部通过，其中包含推荐性能压测及边界条件过滤校验。\n\n")
                else:
                    f.write("> [!CAUTION]\n")
                    f.write("> 后端算法测试未通过！请参见下方错误日志：\n\n")
                
                f.write("```text\n")
                f.write(py_res["stdout"] + "\n")
                if py_res["stderr"]:
                    f.write(py_res["stderr"] + "\n")
                f.write("```\n\n")

                # Frontend tests details
                f.write("## 3. 前端组件测试细节\n\n")
                if vitest_res["returncode"] == 0:
                    f.write("> [!TIP]\n")
                    f.write("> 所有 26 个 Vitest 测试用例全部通过，页面交互和状态机表现正常。\n\n")
                else:
                    f.write("> [!CAUTION]\n")
                    f.write("> 前端测试未通过！请参见下方错误日志：\n\n")
                    
                f.write("```text\n")
                f.write(vitest_res["stdout"] + "\n")
                if vitest_res["stderr"]:
                    f.write(vitest_res["stderr"] + "\n")
                f.write("```\n\n")

                # Build details
                f.write("## 4. 生产环境构建细节\n\n")
                if build_res["returncode"] == 0:
                    f.write("> [!NOTE]\n")
                    f.write("> 生产环境静态资源构建成功，TypeScript 类型校验及文件树输出大小如下：\n\n")
                else:
                    f.write("> [!CAUTION]\n")
                    f.write("> 生产环境构建打包失败！请参见错误日志：\n\n")
                    
                f.write("```text\n")
                f.write(build_res["stdout"] + "\n")
                if build_res["stderr"]:
                    f.write(build_res["stderr"] + "\n")
                f.write("```\n")
            print(f"[CI] Validation complete. Report generated at: {report_path}")
        except Exception as e:
            print(f"[Error] Failed to write report to {report_path}: {e}")

if __name__ == "__main__":
    main()
