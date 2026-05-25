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
