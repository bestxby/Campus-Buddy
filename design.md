# 🧭 Campus Buddy — 校园活动搭子匹配图系统设计文档

本项目完全基于 AI Coding 结对编程模式开发，是一个无向无权异构图建模系统，用于从虚构的兴趣问卷和活动清单中构建社交网络图，帮助学生查询适合的校园活动、匹配志同道合的活动搭子，并分析兴趣社区的连通性。本系统同时提供了高性能的 Python 命令行 MVP 与现代化极客霓虹感（Slate & Neon）的 Vue 3 + D3.js + TypeScript 可视化 Web 界面。

---

## 📅 一、项目目标与最小功能范围

### 1. 项目目标
利用图论相关数据结构与搜索算法对校园社交关系进行建模，以兴趣标签作为“桥梁”介质，实现跨实体的双跳关系推荐。解决校园中“活动查找困难”和“孤立个体缺乏社交途径”的问题。

### 2. 最小功能范围 (MVP)
* **图的构建**：支持从 CSV 文件中读取学生、兴趣和活动数据，并建立无向无权的图结构。
* **邻接表保存**：利用邻接表（Adjacency List）保存图的拓扑结构，确保空间和时间的最优性能。
* **推荐活动 (recommend_activities)**：从学生节点出发，基于“学生 -> 兴趣 -> 活动”两跳路径推荐活动。
* **推荐搭子 (recommend_buddies)**：从学生节点出发，基于“学生 -> 兴趣 -> 其他学生”两跳路径匹配拥有共同兴趣的搭子。
* **连通分量 (connected_components)**：识别图中所有互相独立的连通社群网络。
* **打印邻接表**：支持直接打印或返回图的邻接表表达。

---

## 📊 二、数据来源与数据表说明

为了支持系统分析，项目包含三类数据，物理上表现为三张 CSV 数据表，位于 `data/` 目录下：

### 1. 学生兴趣表 (`student_interests.csv`)
记录学生与兴趣标签的关联及兴趣强度。
* **字段**：`student` (学生姓名), `interest` (兴趣名称), `level` (兴趣强度，取值 1-5 整数)
* **示例**：
  ```csv
  student,interest,level
  小明,篮球,5
  小明,Python,4
  小明,摄影,2
  ```

### 2. 活动兴趣表 (`activity_interests.csv`)
记录校园活动与对应兴趣类型的分类关系，包含容量及时间。
* **字段**：`activity` (活动名称), `interest` (关联兴趣), `capacity` (活动容量), `time_slot` (时间段)
* **示例**：
  ```csv
  activity,interest,capacity,time_slot
  周三篮球赛,篮球,10,周三晚
  Python入门工作坊,Python,20,周四晚
  ```

### 3. 学生报名表 (`student_registrations.csv`)
记录学生已经报名的活动（作为直接关联边，在推荐活动时用于去重）。
* **字段**：`student` (学生姓名), `activity` (活动名称)
* **示例**：
  ```csv
  student,activity
  小明,周三篮球赛
  ```

---

## 🌐 三、图的拓扑结构设计

本项目采用**异构无向无权图 (Heterogeneous Undirected Unweighted Graph)** 对系统实体和关联进行建模。

### 1. 顶点类型 (Vertices)
图中的顶点分为三类，为了避免命名冲突，每个节点在图的键（Key）中均带有**类型前缀**：
1. **学生节点**：前缀为 `student:`（如 `student:小明`）
2. **兴趣节点**：前缀为 `interest:`（如 `interest:篮球`）
3. **活动节点**：前缀为 `activity:`（如 `activity:周三篮球赛`）

### 2. 边类型与语义 (Edges)
图中存在三类边，均为**无向、无权**：
* **学生 -- 兴趣 边**：语义为“某一学生对该项兴趣感兴趣”。
* **活动 -- 兴趣 边**：语义为“某一活动属于该项兴趣分类”。
* **学生 -- 活动 边**：语义为“某一学生已报名/注册参加该活动”（用于推荐去重）。

### 3. 邻接表设计说明
本系统使用邻接表（Adjacency List）来保存图的拓扑结构，具体在 Python 中使用 `defaultdict(set)` 实现。
* **键 (Key)**：表示顶点的唯一标识符字符串（例如 `"student:小明"`）。
* **值 (Value)**：一个 `set`，包含与该顶点相连的所有邻居顶点字符串（例如 `{"interest:篮球", "interest:Python", "activity:周三篮球赛"}`）。

#### 设计决策分析：
* **稀疏图适用性**：校园网络中，学生和活动的数量很多，但每个节点的实际连接度数（即邻居数）非常有限。邻接表空间复杂度为 $O(V + E)$，相较于邻接矩阵的 $O(V^2)$ 大幅降低了内存开销。
* **高速两跳邻居查找**：BFS 及多步推荐时需频繁访问邻居节点。邻接表能以 $O(\text{deg}(v))$ 的时间开销获取某个节点的所有邻居，远优于邻接矩阵的 $O(V)$。
* **隔离重名节点**：利用 `"student:"`、`"interest:"`、`"activity:"` 前缀对节点命名空间进行硬隔离，即使存在名为“篮球”的活动和兴趣，它们也在图中被正确映射为 `interest:篮球` 与 `activity:篮球` 两个完全独立的节点，避免哈希覆盖。

---

## 🔌 四、核心接口说明

### 1. Python 后端核心接口 (`CampusBuddyGraph` 类)

* **`add_edge(u: str, v: str) -> None`**
  在图的邻接表中增加一条无向边，关联节点 `u` 和 `v`。同时向 `self.graph[u]` 中添加 `v`，向 `self.graph[v]` 中添加 `u`。
  
* **`add_student_interest(student: str, interest: str, level: int = None) -> None`**
  生成学生节点与兴趣节点，并建立它们之间的无向边。若提供 `level` 权重参数，则在外部哈希映射中存储该键值的关联。
  
* **`add_activity_interest(activity: str, interest: str, capacity: int = None, time_slot: str = None) -> None`**
  生成活动节点与兴趣节点并建边，保存活动容量与时间段等外部属性。
  
* **`recommend_activities(student: str) -> List[str]`**
  基础活动推荐。针对输入学生名进行两跳查找并去重，返回推荐活动名称列表（按字典序升序）。
  
* **`recommend_buddies(student: str) -> List[str]`**
  基础搭子推荐。针对输入学生名进行两跳查找，排除自己后返回所有相关搭子名称列表（按字典序升序）。
  
* **`connected_components() -> List[List[str]]`**
  计算图的全部极大连通分量，返回一个连通分量列表，每个分量内部按字典序排序。

* **`recommend_buddies_ranked(student: str) -> List[Tuple[str, float, List[str]]]`** (扩展功能)
  计算与该学生具有共同兴趣的所有搭子，通过 Jaccard 相似度算法排序。返回三元组列表：`(搭子名, Jaccard相似度分数, 共同兴趣列表)`。

* **`find_path(student_a: str, student_b: str, private_students: Set[str] = None) -> List[str]`** (扩展功能)
  利用带有前驱节点回溯和隐私过滤功能的 BFS 寻路算法，查找 `student_a` 到 `student_b` 的最短关系路径。

### 2. 前端 TypeScript 核心接口

* **`GraphNode` & `GraphLink` 接口**：
  定义了 D3.js 仿真引擎中节点和连线的数据结构：
  ```typescript
  export interface GraphNode {
    id: string; // "student:姓名" | "interest:名称" | "activity:名称"
    label: string; // 展示的中文文本
    type: 'student' | 'interest' | 'activity' | 'buddy';
    x?: number;
    y?: number;
    size: number;
    color: string;
  }
  
  export interface GraphLink {
    source: string;
    target: string;
  }
  ```

* **`RecommendedBuddy` 接口**：
  前端匹配搭子的数据定义：
  ```typescript
  export interface RecommendedBuddy {
    name: string;
    jaccard: number;
    sharedInterests: string[];
  }
  ```

---

## 🧠 五、算法设计与实现说明

### 1. 推荐活动算法说明 (recommend_activities)
* **路径语义**：`Student -> Interest -> Activity`（2跳）。
* **算法步骤**：
  1. 获取学生节点 `student:A` 在邻接表中的所有直接邻居。
  2. 过滤保留以 `interest:` 为前缀的节点。
  3. 遍历这些兴趣节点的邻居，过滤出以 `activity:` 为前缀的节点。
  4. 检索 `self.graph[student:A]` 剔除该学生已经直接报名（已存在直连边）的活动。
  5. 返回过滤去重并按字典序排序的推荐活动列表。

### 2. 推荐搭子算法说明 (recommend_buddies)
* **路径语义**：`Student -> Interest -> Other Student`（2跳）。
* **算法步骤**：
  1. 获取学生节点 `student:A` 的所有兴趣邻居。
  2. 遍历这些兴趣节点，找出与之连接的、前缀为 `student:` 且不等于 `student:A` 本身的其他学生节点。
  3. 将这些搭子的前缀去除，进行字典序排序并返回。

### 3. 连通分量算法说明 (connected_components)
* **实现逻辑**：使用广度优先搜索 (BFS) 遍历全图，识别所有独立的连通子图。
* **算法步骤**：
  1. 初始化全局已访问集合 `visited = set()` 以及组件列表 `components = []`。
  2. 遍历邻接表中所有的顶点节点。如果该顶点未在 `visited` 中，则说明发现了一个新的连通圈子。
  3. 启动一个本地的 BFS 队列 `queue = deque([start])` 并打上 `visited` 标签。
  4. 当队列不为空时，不断弹出队列首部节点，将其加入当前的 `component` 列表中，并将它的所有未被访问的邻居节点标记为已访问并压入队列。
  5. 当前 BFS 结束后，将排好序的 `component` 放入 `components`，继续寻找下一个未访问的顶点，直到全图遍历完毕。

---

## 🚀 六、扩展功能说明

### 1. Jaccard 相似度搭子排序 (recommend_buddies_ranked)与社交特权
在匹配出搭子后，系统计算该搭子与当前学生的 Jaccard 系数进行契合度排序。
* Jaccard 公式：$J(A, B) = \frac{|Interests_A \cap Interests_B|}{|Interests_A \cup Interests_B|}$。
* **社交特权模式 (Social Boost)**：若被匹配的学生开启了社交特权，其契合度得分会自动乘以系数 `1.3`。最终分数上限截断为 `1.0`（通过 `min(1.0, score * 1.3)` 限制），确保排序不会由于乘数效应溢出数学上限，保证排名正确性。

### 2. 隐私过滤 BFS 关系寻路 (find_path)
实现任意两学生节点之间的最短路径，用以展示“人脉跨越路径”。
* **隐私过滤算法**：在 BFS 队列扩展时，系统会检查下一个节点的隐私状态（`isPrivate`）。如果是中间学生节点且开启了隐私模式，则跳过该节点（绕路）；如果目标学生节点开启了隐私，直接返回无路径，保护学生社交隐私。
* **前驱节点回溯 (Parent-Map Tracking)**：不使用传统直接拷贝路径的方式（那会导致队列空间爆炸），而是在遍历中使用哈希映射 `parent = {node: parent_node}` 记录每个节点的前驱。找到目标后从终点向上溯源回原点，将空间复杂度降到最优的 $O(V)$。

### 3. 多格式匹配报告导出与高清/排版优化 (Multi-Format Exporter)
系统支持将个人推荐报告一键导出为四种格式：
* **Markdown 文档 (.md)**：纯文本输出，采用 UTF-8 BOM 编码，防止 Windows 中文乱码。
* **离线 HTML 网页 (.html)**：带苹果风卡片式排版。内置一个高清互动的 Canvas 拓扑图结构，通过在鼠标移动时使用哈希碰撞检测（哈希集合内的节点坐标碰撞）实现节点悬停高亮、关联线条发光及动态 Tooltip。
* **学术 PDF 报告 (.pdf)**：采用独立的打印样式表。图谱在打印时会被自动重写为高对比度光线模式（黑色文字标签，高饱和度节点及淡灰背景），确保打印输出清晰。
* **超高清分享海报 (.png)**：使用 HTML5 Canvas 导出 **2400x3600 px**（超高清）的精美分享图。
  * **抗锯齿与清晰度**：采用 `ctx.scale(2, 2)` 并启用 `ctx.imageSmoothingQuality = 'high'` 实现清晰反锯齿渲染。
  * **文字防线重合背板**：为所有星座节点文本绘制了背景圆角胶囊舱保护色块，使得交叉线从文本后方穿过时不遮挡、不干扰字体的阅读。
  * **越界排版优化**：收缩了星座半径（从 $140/245 \text{ px}$ 调至 **$120/210 \text{ px}$**），使之完全局限在绘图框内，且完全消除了与卡片标题和底边界越界重合的问题。
  * **精细化中心轴对齐**：使用 `textBaseline = 'middle'` 让头像框文字、徽章与状态栏在水平方向上完美对齐。

---

## 📈 七、关键操作的时间复杂度与空间复杂度

设 $V$ 为图的顶点总数，$E$ 为图的边总数。对于局部的两跳查询，设顶点的平均度数为 $d_{\text{avg}}$，与当前学生有共同兴趣的搭子数量为 $B$。

| 操作项目 | 时间复杂度 | 空间复杂度 | 复杂度分析说明 |
| :--- | :--- | :--- | :--- |
| **建图 (Build Graph)** | $O(E)$ | $O(V + E)$ | 遍历 CSV 数据读取 $E$ 条边，每次使用哈希表的 `add()` 操作为 $O(1)$，共执行 $O(E)$ 次。 |
| **打印邻接表 (Print Graph)** | $O(V \log V + E)$ | $O(1)$ (辅助) | 遍历邻接表。为了输出确定性结果，对所有顶点键名进行排序耗时 $O(V \log V)$，打印各顶点关联的所有邻居节点需要遍历所有邻接边，耗时 $O(E)$。 |
| **推荐活动 (Recommend Activities)** | $O(d_{\text{avg}}^2)$ | $O(d_{\text{avg}}^2)$ | 从当前节点出发，先遍历其直接兴趣邻居（最多 $d_{\text{avg}}$ 个），再对每个兴趣节点遍历其活动邻居（最多 $d_{\text{avg}}$ 个），最后与自身已报名活动进行集合差集计算。在稀疏图里 $d_{\text{avg}} \ll V$，速度极快。 |
| **推荐搭子 (Recommend Buddies)** | $O(d_{\text{avg}}^2)$ | $O(B)$ | 路径同样为两跳。遍历兴趣邻居（最多 $d_{\text{avg}}$），再遍历连接这些兴趣的其他学生邻居（最多 $d_{\text{avg}}$），使用 Set 过滤出独特的 $B$ 个搭子。 |
| **查找连通分量 (Connected Components)** | $O(V + E)$ | $O(V)$ | 标准全图 BFS。所有顶点和边在整个遍历过程中都只入队和被访问一次，空间上需要一个大小为 $O(V)$ 的 `visited` 集合。 |
| **Jaccard 相似度搭子排序 (扩展功能)** | $O(B \cdot d_{\text{avg}} + B \log B)$ | $O(B)$ | 对 $B$ 个搭子，计算他们与当前学生的兴趣交集/并集（大小 $\le d_{\text{avg}}$），耗时 $O(B \cdot d_{\text{avg}})$。之后对 $B$ 个搭子进行排序需要 $O(B \log B)$ 的开销。 |
| **BFS 隐私过滤关系寻路 (扩展功能)** | $O(V + E)$ | $O(V)$ | 使用队列执行 BFS 搜索。最坏情况下会扫描全图，由于不直接复制路径而是使用哈希前驱映射（Predecessor Map）追溯，空间消耗控制在 $O(V)$。 |
| **报告一键导出生成 (扩展功能)** | $O(d_{\text{avg}}^2 + B \cdot d_{\text{avg}} + B \log B)$ | $O(V + B)$ | 整合画像标签提取、智能推荐、搭子排序以及网络参数，最后输出磁盘流文件。时间复杂度取决于算法的核心搜索开销，空间复杂度取决于报告的渲染尺寸。 |

---

## 🧪 八、边界情况与测试设计

系统在 Python 单元测试（pytest 22个通过）和 Vitest（26个通过）中对图底层进行了多层断言测试，保证健壮性：

1. **重复添加相同的关联边**：由于邻接表的值（Value）采用哈希集合 `set` 保存，添加重复边会自动被去重（幂等性），图的结构不会产生脏数据。
2. **孤立节点（没有任何兴趣和活动的学生）**：
   * 在两跳推荐中，该学生节点的直接邻居为空，算法在外层循环中会直接跳过，安全返回 `[]`，不会抛出 KeyError 或除零错误。
   * 计算 Jaccard 相似度时，若学生没有任何兴趣，并集 $\text{Union}$ 为 `0`，算法捕获该边界：`if not union: jaccard = 0.0`，从而避免除零崩溃。
3. **节点重名但类型不同**：测试中，建立了同为 `篮球` 的学生、活动和兴趣。前缀解析器能够正确剥离 `"student:篮球"`、`"activity:篮球"` 与 `"interest:篮球"`，在测试断言中它们的哈希值完全不相等，图论搜索结果正常。
4. **隐私阻断测试**：
   * 测试当路径终点学生开启隐私模式时，`find_path` 是否返回 `None`；
   * 测试当路径中间经过开启了隐私的学生时，`find_path` 是否能避开他（绕路）寻找到另一条通路。测试均符合预期。

---

## 🤖 九、AI Coding 结对编程过程反思

在整个 `Campus Buddy` 的开发与重构生命周期中，人类开发者与 AI Assistant 形成了一种非常高效的“Driver & Navigator”结对模式：

1. **严格的图设计约束**：
   在开发前，人类给 AI 设定了“必须使用带类型前缀的无向无权图”和“必须使用邻接表（Adjacency List）”的刚性设计约束。AI 能够在此约束下，以最简洁的 `defaultdict(set)` 模式建立高内聚低耦合的代码模块。

2. **核心寻路算法的空间优化**：
   在第一版 BFS 最短寻路代码中，AI 习惯性地将遍历到的整条路径直接拷贝并存储在 BFS 队列中。这在稠密图的大数据量下会导致巨大的空间开销。人类及时指出这一逻辑漏洞，并指示其采用“前驱节点记录图 (Predecessor Map)”，仅在队列里存单节点，寻路结束后反向溯源。该重构减少了队列内存分配，将 BFS 辅助空间复杂度从指数级拉回到严格的 $O(V)$。

3. **健壮的除零安全保护**：
   在最初编写 Jaccard 相似度时，AI 未能考虑到无任何兴趣的高校新生的边界条件（此时并集 $\text{Union} = 0$）。在运行测试套件时发现了 ZeroDivisionError 报错，人类提示后，AI 能够快速建立安全的分支防御机制。

4. **渐进式面向对象解耦 (Refactoring)**：
   随着系统从单纯的命令行逻辑发展到 Vue 3 可视化看板，原先的组件行数严重超标（超过 $1100$ 行），给系统带来了很高的 Regression 风险。在后期的稳定性重构阶段，AI 协助人类执行了“UI 与重度算法逻辑彻底分离”的方案。将繁杂的数据生成、Canvas 绘制从 [ExportModal.vue](file:///e:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend/src/components/ExportModal.vue) 提取到了独立的 [reportGenerator.ts](file:///e:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend/src/utils/reportGenerator.ts) 和 [canvasPoster.ts](file:///e:/学习/大二下课程/数据结构与算法/数据结构大作业/Campus-Buddy/frontend/src/utils/canvasPoster.ts) 中，成功做到了每一个文件行数都控制在 $300$ 行左右。

通过这种“约束-审查-纠错-迭代”的结对合作，系统不仅在功能上极其完善，而且在工程质量、可维护性以及类型安全上都表现优异。
