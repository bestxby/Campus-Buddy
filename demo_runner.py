from campus_buddy import CampusBuddyGraph

def create_demo_graph():
    g = CampusBuddyGraph()

    # Lecture Student Interests data
    student_interests = [
        ("小明", "篮球"),
        ("小明", "Python"),
        ("小明", "摄影"),
        ("小红", "摄影"),
        ("小红", "羽毛球"),
        ("小红", "志愿服务"),
        ("小刚", "Python"),
        ("小刚", "算法竞赛"),
        ("小丽", "羽毛球"),
        ("小丽", "电影"),
        ("小王", "志愿服务"),
        ("小王", "摄影"),
        ("小赵", "篮球"),
        ("小赵", "电影"),
    ]

    # Lecture Activity Interests data
    activity_interests = [
        ("周三篮球赛", "篮球"),
        ("Python入门工作坊", "Python"),
        ("校园摄影散步", "摄影"),
        ("羽毛球双打局", "羽毛球"),
        ("公益志愿活动", "志愿服务"),
        ("算法刷题夜", "算法竞赛"),
        ("电影放映会", "电影"),
    ]

    # Populate edges
    for student, interest in student_interests:
        g.add_student_interest(student, interest)

    for activity, interest in activity_interests:
        g.add_activity_interest(activity, interest)

    return g

def main():
    print("=" * 60)
    print("      CAMPUS BUDDY GRAPH MATCHING MVP DEMONSTRATION")
    print("=" * 60)

    g = create_demo_graph()

    # 1. Print adjacency list
    print("\n[Graph Structure] Adjacency List:")
    for node in sorted(g.graph.keys()):
        neighbors = ", ".join(sorted(g.graph[node]))
        print(f"  {node} -> {{{neighbors}}}")

    # 2. Activity recommendations for 小明
    print("\n" + "-" * 60)
    print("  1. Activity Recommendations for '小明' (Target: Basketball, Python, Photo)")
    print("-" * 60)
    activities = g.recommend_activities("小明")
    print(f"  Recommended activities: {activities}")
    print("  Expected: ['Python入门工作坊', '周三篮球赛', '校园摄影散步']")

    # 3. Buddy recommendations for 小明
    print("\n" + "-" * 60)
    print("  2. Buddy Recommendations for '小明' (Target: share Basketball/Python/Photo)")
    print("-" * 60)
    buddies = g.recommend_buddies("小明")
    print(f"  Recommended buddies: {buddies}")
    print("  Expected: ['小刚', '小红', '小王', '小赵']")

    # 4. Connected Components
    print("\n" + "-" * 60)
    print("  3. Connected Communities (Connected Components)")
    print("-" * 60)
    components = g.connected_components()
    print(f"  Total connected components found: {len(components)}")
    for idx, comp in enumerate(components, 1):
        print(f"  Component {idx}:")
        students = [n.removeprefix("student:") for n in comp if n.startswith("student:")]
        interests = [n.removeprefix("interest:") for n in comp if n.startswith("interest:")]
        activities = [n.removeprefix("activity:") for n in comp if n.startswith("activity:")]
        print(f"    - Students: {sorted(students)}")
        print(f"    - Interests: {sorted(interests)}")
        print(f"    - Activities: {sorted(activities)}")

    print("\n" + "=" * 60)
    print("              DEMONSTRATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
