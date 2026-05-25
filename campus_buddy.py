from collections import defaultdict, deque
import csv

class CampusBuddyGraph:
    def __init__(self):
        # Initialize the adjacency list using a defaultdict of sets
        self.graph = defaultdict(set)

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

    def add_student_interest(self, student, interest):
        """
        Adds an edge representing student's interest.
        """
        s = self.node("student", student)
        i = self.node("interest", interest)
        self.add_edge(s, i)

    def add_activity_interest(self, activity, interest):
        """
        Adds an edge representing activity's interest type.
        """
        a = self.node("activity", activity)
        i = self.node("interest", interest)
        self.add_edge(a, i)

    def recommend_activities(self, student):
        """
        Recommends activities for a student.
        Should trace: student -> interest -> activity (2 hops).
        Returns a sorted list of unique activity names (clean names, e.g. "周三篮球赛").
        """
        start = self.node("student", student)
        activities = set()

        for interest in self.graph[start]:
            if not interest.startswith("interest:"):
                continue
            for neighbor in self.graph[interest]:
                if neighbor.startswith("activity:"):
                    # Remove prefix 'activity:' to return clean name
                    activities.add(neighbor.removeprefix("activity:"))

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

    def find_path(self, student_a, student_b):
        """
        Finds the shortest path (BFS) between two student nodes in the graph.
        Demonstrates the "six degrees of separation" concept.

        Returns a list of node keys representing the path from student_a to
        student_b (e.g. ['student:小明', 'interest:篮球', 'student:小红']).
        Returns None if no path exists between the two students.
        """
        start = self.node("student", student_a)
        end = self.node("student", student_b)

        if start not in self.graph or end not in self.graph:
            return None
        if start == end:
            return [start]

        # BFS with path tracking
        queue = deque([(start, [start])])
        visited = {start}

        while queue:
            current, path = queue.popleft()

            for neighbor in self.graph[current]:
                if neighbor in visited:
                    continue
                new_path = path + [neighbor]
                if neighbor == end:
                    return new_path
                visited.add(neighbor)
                queue.append((neighbor, new_path))

        return None  # No path found (disconnected graph)

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
        CSV format: student,interest
        """
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header if it exists
            header = next(reader, None)
            for row in reader:
                if not row or len(row) < 2:
                    continue
                self.add_student_interest(row[0].strip(), row[1].strip())

    def load_activities_from_csv(self, file_path):
        """
        Loads activity interests from a CSV file.
        CSV format: activity,interest
        """
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header if it exists
            header = next(reader, None)
            for row in reader:
                if not row or len(row) < 2:
                    continue
                self.add_activity_interest(row[0].strip(), row[1].strip())
