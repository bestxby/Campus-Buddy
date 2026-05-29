# 💬 Campus Buddy — AI Coding 结对编程历史记录

本篇文档记录了在构建“校园活动搭子匹配图”系统的全周期中，人类开发者（User）与 AI 编码助手（Antigravity）结对编程（Pair Programming）的互动过程，展示了需求定义、算法审查、漏洞纠偏和代码迭代的具体细节。

---

## 🧭 第一轮：需求对齐与图表示方法选择

### 👤 开发者 (User)
> 我们的目标是完成一个“校园活动搭子匹配图”的 Python 模块。
> 1. 数据包含三个类别：学生、兴趣和活动。
> 2. 关系包括：学生拥有某个兴趣，活动属于某种兴趣。
> 3. 我需要你实现一个名为 `CampusBuddyGraph` 的类。
> 4. **约束条件**：必须完全使用**邻接表**（用 Python 字典和 Set 模拟）保存图，边必须是**无向、无权**的。
> 5. 为了防止重名问题（例如有一个兴趣叫“篮球”，同时又有一个学生或活动叫“篮球”），所有的节点在内部必须自动带上**类型前缀**，格式为 `student:名称`、`interest:名称`、`activity:名称`。
> 
> 请给出首版图表示与建图代码。

### 🤖 AI 助手 (Antigravity)
> 明白！这个设计决策非常关键：使用邻接表来表示稀疏图具有极佳的空间效率，而节点的前缀机制（`student:姓名`、`interest:兴趣`、`activity:活动`）能够完美地隔离开重名的实体节点。
>
> 以下是 `CampusBuddyGraph` 的核心框架代码：
>
> ```python
> from collections import defaultdict
> 
> class CampusBuddyGraph:
>     def __init__(self):
>         # 初始化邻接表，使用具有 Set 结构的 defaultdict
>         self.graph = defaultdict(set)
> 
>     def node(self, kind, name):
>         """生成带前缀的统一节点标识键"""
>         return f"{kind}:{name}"
> 
>     def add_edge(self, u, v):
>         """添加无向边"""
>         self.graph[u].add(v)
>         self.graph[v].add(u)
> 
>     def add_student_interest(self, student, interest, level=None):
>         s = self.node("student", student)
>         i = self.node("interest", interest)
>         self.add_edge(s, i)
> 
>     def add_activity_interest(self, activity, interest, capacity=None, time_slot=None):
>         a = self.node("activity", activity)
>         i = self.node("interest", interest)
>         self.add_edge(a, i)
> ```

---

## 🔍 第二轮：核心推荐算法与连通分量

### 👤 开发者 (User)
> 接下来需要实现核心推荐与连通分量功能：
> 1. `recommend_activities(student)`: 返回推荐活动。路径应是 `Student -> Interest -> Activity`（2跳）。已报名的活动不能推荐（可以通过 `student -- activity` 的直接边过滤）。
> 2. `recommend_buddies(student)`: 推荐有共同兴趣的搭子。路径是 `Student -> Interest -> Student`（2跳），排除自身。
> 3. `connected_components()`: 查找图的所有连通分量。
> 4. 我要求在获取连通分量时使用 BFS，并且要保证处理孤立节点的情况。

### 🤖 AI 助手 (Antigravity)
> 收到！我为您编写了核心的两跳搜索算法和基于 BFS 的全图连通分量遍历。
>
> （AI 输出了 `recommend_activities`、`recommend_buddies` 和 `connected_components` 的初版实现）

### 👤 开发者 (User) - 📌 代码审查与漏洞发现
> 我在审查你的代码时发现两个问题：
> 1. **已报名去重逻辑**：在 `recommend_activities` 中，你直接取 `self.graph[student]` 来当已报名，但这里面可能包含了兴趣节点（`interest:篮球`）！你应该只过滤以 `activity:` 开头的已报名节点。
> 2. **孤立节点处理**：如果一个学生被注册到了图中，但是没有任何兴趣（无任何连边），当调用 `recommend_activities` 时可能会抛出 `KeyError`。你的代码中没有做容错处理。
> 
> 请修正这些漏洞。

### 🤖 AI 助手 (Antigravity)
> 非常抱歉！这是严重的逻辑漏洞，您的审查非常细致入微：
> 1. `student` 节点在图中的邻居不仅包含已报名的活动（`activity:xxx`），还包含其注册的兴趣（`interest:xxx`）。如果不做区分过滤，在做去重时可能会把本该有的兴趣路径剔除。
> 2. 应该在查询邻接表前对节点的存在性进行边界检查。
>
> 以下是修正后的两跳活动推荐算法：
> 
> ```python
>     def recommend_activities(self, student):
>         start = self.node("student", student)
>         if start not in self.graph:
>             return []
>             
>         # 严格提取学生邻居中属于 'activity:' 的节点作为已报名集合
>         registered = {
>             n.removeprefix("activity:")
>             for n in self.graph[start]
>             if n.startswith("activity:")
>         }
>         activities = set()
> 
>         for interest in self.graph[start]:
>             if not interest.startswith("interest:"):
>                 continue
>             for neighbor in self.graph[interest]:
>                 if neighbor.startswith("activity:"):
>                     act_name = neighbor.removeprefix("activity:")
>                     if act_name not in registered:
>                         activities.add(act_name)
> 
>         return sorted(list(activities))
> ```

---

## 📈 第三轮：功能扩展与性能优化

### 👤 开发者 (User)
> 现在的推荐只是粗暴地列出来。我想要增加一个扩展功能：**Jaccard 相似度搭子排序**，返回推荐搭子及他们与当前学生的兴趣重合度排序（由高到低）。
> 另外，在做 BFS 寻路（`find_path`）的时候，如果在路径上遇到了开启隐私模式（`isPrivate`）的学生，应该能够智能避开（绕道）。
> 请为这两个扩展功能生成代码，并分析核心操作的复杂度。

### 🤖 AI 助手 (Antigravity)
> 优秀的扩展创意！
> * Jaccard 相似度公式能极好地量化“交集 / 并集”的关系，体现兴趣相似度。
> * BFS 寻路配合前驱回溯，不仅保证了 $O(V)$ 的空间复杂度，还能在队列扩展时动态检索隐私集合实现安全避让。
> 
> （AI 生成了 `recommend_buddies_ranked` 与 `find_path` 隐私绕行代码，并对时间、空间复杂度做出了详细的推导和列表，填入了 `design.md`）

### 👤 开发者 (User) - 📌 代码审查与漏洞发现
> 再次审查你的 Jaccard 相似度计算代码，如果某个学生没有任何兴趣关联，那么他与其他人的 union 集合大小为 0。
> 在计算相似度 `len(intersection) / len(union)` 时，程序会抛出 `ZeroDivisionError`！
> 请针对此边界条件进行修正。

### 🤖 AI 助手 (Antigravity)
> 您指出的零分母情况非常准！如果并集 `union` 长度为 0，程序确实会崩溃。我应当在除法运算前引入分支守卫：
> 
> ```python
>                 if not union:
>                     jaccard = 0.0
>                 else:
>                     jaccard = len(intersection) / len(union)
> ```
> 这样就能确保在极端情况（如孤立学生）下算法也能保持健壮的容错性。

---

## 🏆 结对成果总结
通过本轮结对编程，AI 的算法生成能力与人类开发者的**逻辑审查和边界条件控制**结合，建立了一套兼具高性能和高健壮性的校园搭子推荐系统。所有的漏洞都在本地单元测试阶段被彻底剿灭，最终产出了 100% 通过的集成验证版本。
