from collections import defaultdict, deque
import csv

class CampusBuddyGraph:
    def __init__(self):
        # Initialize the adjacency list using a defaultdict of sets
        self.graph = defaultdict(set)
        # Store metadata fields from expanded tables
        self.student_interest_levels = {}
        self.activity_capacities = {}
        self.activity_time_slots = {}

    def node(self, kind, name):
        """
        Helper method to format the node key to prevent name collisions.
        Returns a string formatted as 'kind:name'.
        Example: node('student', '小明') -> 'student:小明'
        """
        return f"{kind}:{name}"

    def add_edge(self, u, v):
        """
        Adds an undirected, unweighted edge between node u and node v.
        Remember to store the relation in both directions.
        """
        self.graph[u].add(v)
        self.graph[v].add(u)

    def add_student_interest(self, student, interest, level=None):
        """
        Adds an edge representing student's interest, storing interest level if provided.
        """
        s = self.node("student", student)
        i = self.node("interest", interest)
        self.add_edge(s, i)
        if level is not None:
            self.student_interest_levels[(student, interest)] = level

    def add_activity_interest(self, activity, interest, capacity=None, time_slot=None):
        """
        Adds an edge representing activity's interest type, storing capacity and time slot if provided.
        """
        a = self.node("activity", activity)
        i = self.node("interest", interest)
        self.add_edge(a, i)
        if capacity is not None:
            self.activity_capacities[activity] = capacity
        if time_slot is not None:
            self.activity_time_slots[activity] = time_slot

    def get_adjacency_list(self):
        """
        Returns the raw adjacency list (defaultdict of sets) representing the graph.
        """
        return self.graph

    def print_adjacency_list(self):
        """
        Prints the adjacency list of the graph in a readable format.
        """
        for node in sorted(self.graph.keys()):
            neighbors = ", ".join(sorted(self.graph[node]))
            print(f"  {node} -> {{{neighbors}}}")

    def recommend_activities(self, student):
        """
        Recommends activities for a student.
        Should trace: student -> interest -> activity (2 hops).
        Excludes activities the student has already registered for.
        Returns a sorted list of unique activity names (clean names, e.g. "周三篮球赛").
        """
        start = self.node("student", student)
        registered = {
            n.removeprefix("activity:")
            for n in self.graph[start]
            if n.startswith("activity:")
        }
        activities = set()

        for interest in self.graph[start]:
            if not interest.startswith("interest:"):
                continue
            for neighbor in self.graph[interest]:
                if neighbor.startswith("activity:"):
                    act_name = neighbor.removeprefix("activity:")
                    if act_name not in registered:
                        activities.add(act_name)

        return sorted(list(activities))

    def get_activity_recommendations_with_paths(self, student):
        """
        Recommends activities with their explanation path and metadata.
        Returns a list of dicts: [
            {
                "activity": "周三篮球赛",
                "interest": "篮球",
                "level": 5,
                "capacity": 10,
                "time_slot": "周三晚",
                "path": "student:小明 --(兴趣强度: 5)--> interest:篮球 ----> activity:周三篮球赛"
            },
            ...
        ]
        """
        start = self.node("student", student)
        if start not in self.graph:
            return []

        registered = {
            n.removeprefix("activity:")
            for n in self.graph[start]
            if n.startswith("activity:")
        }
        
        recommendations = []
        for interest_node in self.graph[start]:
            if not interest_node.startswith("interest:"):
                continue
            interest_name = interest_node.removeprefix("interest:")
            # Retrieve the student's interest level if it exists, default to "未设"
            level = self.student_interest_levels.get((student, interest_name), "未设")
            
            for neighbor in self.graph[interest_node]:
                if neighbor.startswith("activity:"):
                    act_name = neighbor.removeprefix("activity:")
                    if act_name not in registered:
                        capacity = self.activity_capacities.get(act_name, "未设")
                        time_slot = self.activity_time_slots.get(act_name, "未设")
                        
                        path_str = f"student:{student} --(兴趣强度: {level})--> interest:{interest_name} ----> activity:{act_name}"
                        recommendations.append({
                            "activity": act_name,
                            "interest": interest_name,
                            "level": level,
                            "capacity": capacity,
                            "time_slot": time_slot,
                            "path": path_str
                        })
                        
        # Sort by level descending (if level is int, otherwise treat as 0), then by activity name
        def get_sort_key(item):
            lvl = item["level"]
            lvl_val = lvl if isinstance(lvl, int) else 0
            return (-lvl_val, item["activity"])
            
        return sorted(recommendations, key=get_sort_key)

    def export_recommendation_report(self, student, file_path=None):
        """
        Generates a markdown recommendation report for a student and optionally exports to file.
        Returns the markdown string.
        """
        import os
        start = self.node("student", student)
        if start not in self.graph:
            raise ValueError(f"Student '{student}' not found in the graph.")

        # 1. Gather student interests
        interests = []
        for n in self.graph[start]:
            if n.startswith("interest:"):
                name = n.removeprefix("interest:")
                lvl = self.student_interest_levels.get((student, name), "未设")
                interests.append((name, lvl))
        interests.sort(key=lambda x: (-x[1] if isinstance(x[1], int) else 0, x[0]))

        # 2. Get activity recommendations with paths
        act_recs = self.get_activity_recommendations_with_paths(student)

        # 3. Get buddy recommendations (ranked by Jaccard similarity)
        buddies = self.recommend_buddies_ranked(student)

        # Build Markdown content
        md = []
        md.append(f"# 🧭 Campus Buddy 个性化校园推荐报告 — {student}")
        md.append(f"\n> **报告生成时间**: 2026-05-29")
        md.append(f"\n---\n")

        # Section 1: User Profile
        md.append("## 👤 个人画像与标签")
        if interests:
            md.append("您目前在系统登记的兴趣倾向及强度（1-5）：\n")
            for name, lvl in interests:
                stars = "★" * lvl if isinstance(lvl, int) else "未设定"
                md.append(f"* **{name}** (兴趣等级: `{lvl}` {stars})")
        else:
            md.append("您目前尚未在系统中登记任何兴趣。")
        md.append("\n---\n")

        # Section 2: Recommended Activities
        md.append("## 🎉 智能活动推荐")
        if act_recs:
            md.append("系统根据您的兴趣标签，为您匹配了以下尚未报名的活动：\n")
            for idx, item in enumerate(act_recs, 1):
                md.append(f"### {idx}. {item['activity']}")
                md.append(f"* **所属兴趣圈**: 🎯 `{item['interest']}`")
                md.append(f"* **活动容量**: 👥 `{item['capacity']} 人` | **时间段**: ⏰ `{item['time_slot']}`")
                md.append(f"* **推荐纽带**:")
                md.append(f"  `{item['path']}`\n")
        else:
            md.append("暂时没有基于您的兴趣推荐的活动。您可以尝试添加更多兴趣标签！")
        md.append("\n---\n")

        # Section 3: Recommended Buddies (Limit to top 10)
        md.append("## 🤝 志同道合的活动搭子")
        if buddies:
            md.append("系统为您匹配了拥有共同兴趣圈子的同学：\n")
            md.append("| 排名 | 推荐搭子 | 匹配契合度 | 共同的兴趣 |")
            md.append("| --- | --- | --- | --- |")
            for rank, (buddy_name, score, shared) in enumerate(buddies[:10], 1):
                pct = f"{score * 100:.1f}%"
                shared_str = "、".join(shared)
                md.append(f"| #{rank} | **{buddy_name}** | {pct} | {shared_str} |")
        else:
            md.append("暂时没有找到与您拥有共同兴趣的学生。")
        md.append("\n---\n")

        report_content = "\n".join(md)

        # Write to file if file_path is specified
        if file_path:
            # Create directory if it doesn't exist
            dir_name = os.path.dirname(file_path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
            with open(file_path, "w", encoding="utf-8-sig") as f:
                f.write(report_content)

        return report_content

    def recommend_buddies(self, student):
        """
        Recommends activity buddies (other students) for a student.
        Should trace: student -> interest -> other_student (2 hops).
        Make sure to exclude the student themselves!
        Returns a sorted list of unique student names (clean names, e.g. "小红").
        """
        start = self.node("student", student)
        buddies = set()

        for interest in self.graph[start]:
            if not interest.startswith("interest:"):
                continue
            for neighbor in self.graph[interest]:
                if neighbor.startswith("student:") and neighbor != start:
                    # Remove prefix 'student:' to return clean name
                    buddies.add(neighbor.removeprefix("student:"))

        return sorted(list(buddies))

    def recommend_buddies_ranked(self, student):
        """
        Recommends buddies ranked by Jaccard similarity score.
        Jaccard(A, B) = |interests_A & interests_B| / |interests_A | interests_B|

        Returns a list of (buddy_name, jaccard_score, shared_interests) tuples,
        sorted by score descending (most compatible first).

        Example return: [("小红", 0.67, ["篮球", "Python"]), ...]
        """
        start = self.node("student", student)
        s_interests = {
            n for n in self.graph[start] if n.startswith("interest:")
        }

        buddy_scores = {}

        for interest in s_interests:
            for neighbor in self.graph[interest]:
                if not neighbor.startswith("student:") or neighbor == start:
                    continue
                buddy_name = neighbor.removeprefix("student:")
                if buddy_name in buddy_scores:
                    continue  # Already computed for this buddy

                b_interests = {
                    n for n in self.graph[neighbor] if n.startswith("interest:")
                }
                intersection = s_interests & b_interests
                union = s_interests | b_interests

                if not union:
                    jaccard = 0.0
                else:
                    jaccard = len(intersection) / len(union)

                shared_names = sorted(
                    i.removeprefix("interest:") for i in intersection
                )
                buddy_scores[buddy_name] = (jaccard, shared_names)

        # Sort by Jaccard score descending, then by name for stable ordering
        ranked = sorted(
            [(name, score, shared) for name, (score, shared) in buddy_scores.items()],
            key=lambda x: (-x[1], x[0])
        )
        return ranked

    def find_path(self, student_a, student_b, private_students=None):
        """
        Finds the shortest path (BFS) between two student nodes in the graph.
        Demonstrates the "six degrees of separation" concept.

        Returns a list of node keys representing the path from student_a to
        student_b (e.g. ['student:小明', 'interest:篮球', 'student:小红']).
        Returns None if no path exists between the two students.
        """
        if private_students is None:
            private_students = set()

        start = self.node("student", student_a)
        end = self.node("student", student_b)

        if start not in self.graph or end not in self.graph:
            return None
        if start == end:
            return [start]

        # If target is private, do not allow pathfinding to them
        if student_b in private_students:
            return None

        # BFS with predecessor tracking for O(V) space complexity
        queue = deque([start])
        visited = {start}
        parent = {start: None}

        while queue:
            current = queue.popleft()
            if current == end:
                break

            for neighbor in self.graph[current]:
                if neighbor.startswith("student:"):
                    name = neighbor.removeprefix("student:")
                    if name in private_students and neighbor != start:
                        continue
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append(neighbor)

        if end not in parent:
            return None

        path = []
        curr = end
        while curr is not None:
            path.append(curr)
            curr = parent[curr]
        path.reverse()
        return path

    def connected_components(self):
        """
        Finds all connected components (isolated communities) in the campus graph.
        Uses BFS to traverse and discover each component.
        Returns a list of components, where each component is a sorted list of node names (e.g. ['student:小明', ...]).
        """
        visited = set()
        components = []

        for start in self.graph:
            if start in visited:
                continue

            # Start a BFS for a new connected component
            queue = deque([start])
            visited.add(start)
            component = []

            while queue:
                node = queue.popleft()
                component.append(node)

                for neighbor in self.graph[node]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            components.append(sorted(component))

        return components

    def load_students_from_csv(self, file_path):
        """
        Loads student interests from a CSV file.
        CSV format: student,interest[,level]
        """
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header if it exists
            header = next(reader, None)
            for row in reader:
                if not row or len(row) < 2:
                    continue
                student = row[0].strip()
                interest = row[1].strip()
                level = int(row[2].strip()) if len(row) >= 3 and row[2].strip().isdigit() else None
                self.add_student_interest(student, interest, level)

    def load_activities_from_csv(self, file_path):
        """
        Loads activity interests from a CSV file.
        CSV format: activity,interest[,capacity,time_slot]
        """
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header if it exists
            header = next(reader, None)
            for row in reader:
                if not row or len(row) < 2:
                    continue
                activity = row[0].strip()
                interest = row[1].strip()
                capacity = int(row[2].strip()) if len(row) >= 3 and row[2].strip().isdigit() else None
                time_slot = row[3].strip() if len(row) >= 4 else None
                self.add_activity_interest(activity, interest, capacity, time_slot)

    def load_registrations_from_csv(self, file_path):
        """
        Loads student-activity registrations from a CSV file.
        CSV format: student,activity
        """
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header if it exists
            header = next(reader, None)
            for row in reader:
                if not row or len(row) < 2:
                    continue
                s = self.node("student", row[0].strip())
                a = self.node("activity", row[1].strip())
                self.add_edge(s, a)
