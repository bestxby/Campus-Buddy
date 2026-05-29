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
