import pytest
import os
from campus_buddy import CampusBuddyGraph

@pytest.fixture
def sample_graph():
    g = CampusBuddyGraph()
    # Student interests
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
    # Activity interests
    activity_interests = [
        ("周三篮球赛", "篮球"),
        ("Python入门工作坊", "Python"),
        ("校园摄影散步", "摄影"),
        ("羽毛球双打局", "羽毛球"),
        ("公益志愿活动", "志愿服务"),
        ("算法刷题夜", "算法竞赛"),
        ("电影放映会", "电影"),
    ]

    for s, i in student_interests:
        g.add_student_interest(s, i)
    for a, i in activity_interests:
        g.add_activity_interest(a, i)
    return g

def test_recommend_activities(sample_graph):
    # Test for 小明 (interests: Basketball, Python, Photography)
    activities = sample_graph.recommend_activities("小明")
    assert activities == ["Python入门工作坊", "周三篮球赛", "校园摄影散步"]

    # Test for 小刚 (interests: Python, Algorithm)
    activities = sample_graph.recommend_activities("小刚")
    assert activities == ["Python入门工作坊", "算法刷题夜"]

def test_recommend_buddies(sample_graph):
    # Test buddies for 小明
    buddies = sample_graph.recommend_buddies("小明")
    # Share: Basketball with 小赵, Python with 小刚, Photography with 小红 & 小王
    assert buddies == ["小刚", "小王", "小红", "小赵"]

    # Test buddies for 小刚
    buddies = sample_graph.recommend_buddies("小刚")
    # Share: Python with 小明
    assert buddies == ["小明"]

def test_recommend_buddies_ranked(sample_graph):
    """Test Jaccard-ranked buddy recommendations."""
    ranked = sample_graph.recommend_buddies_ranked("小明")
    # 小明 has: {篮球, Python, 摄影} = 3 interests
    # 小红: {摄影, 羽毛球, 志愿服务} → intersection={摄影} union={篮球,Python,摄影,羽毛球,志愿服务} → J=1/5=0.2
    # 小王: {志愿服务, 摄影} → intersection={摄影} union={篮球,Python,摄影,志愿服务} → J=1/4=0.25
    # 小刚: {Python, 算法竞赛} → intersection={Python} union={篮球,Python,摄影,算法竞赛} → J=1/4=0.25
    # 小赵: {篮球, 电影} → intersection={篮球} union={篮球,Python,摄影,电影} → J=1/4=0.25

    # Verify all expected buddies are present
    buddy_names = [r[0] for r in ranked]
    assert set(buddy_names) == {"小刚", "小王", "小红", "小赵"}

    # 小红 has the lowest Jaccard (0.2), should be last
    assert ranked[-1][0] == "小红"

    # Verify score range [0, 1]
    for name, score, shared in ranked:
        assert 0.0 <= score <= 1.0
        assert isinstance(shared, list)
        assert len(shared) >= 1

    # Verify shared interests correctness for 小刚
    刚_entry = next(r for r in ranked if r[0] == "小刚")
    assert "Python" in 刚_entry[2]

def test_recommend_buddies_ranked_monotone(sample_graph):
    """Verify that Jaccard scores are monotonically non-increasing (sorted desc)."""
    ranked = sample_graph.recommend_buddies_ranked("小明")
    scores = [r[1] for r in ranked]
    for i in range(len(scores) - 1):
        assert scores[i] >= scores[i + 1], \
            f"Score at position {i} ({scores[i]}) is less than at {i+1} ({scores[i+1]})"

def test_find_path_direct(sample_graph):
    """Test that find_path returns a 3-node path for students sharing an interest."""
    path = sample_graph.find_path("小明", "小红")
    assert path is not None
    assert path[0] == "student:小明"
    assert path[-1] == "student:小红"
    # Shortest possible: student:小明 -> interest:摄影 -> student:小红 (length 3)
    assert len(path) == 3
    assert "interest:摄影" in path

def test_find_path_same_student(sample_graph):
    """Test that find_path to oneself returns a single-node path."""
    path = sample_graph.find_path("小明", "小明")
    assert path == ["student:小明"]

def test_find_path_no_connection():
    """Test that find_path returns None for completely disconnected students."""
    g = CampusBuddyGraph()
    g.add_student_interest("孤立A", "古琴")
    g.add_student_interest("孤立B", "攀岩")
    # 古琴 and 攀岩 nodes are separate, so no path between students
    path = g.find_path("孤立A", "孤立B")
    assert path is None

def test_find_path_through_multiple_hops(sample_graph):
    """Test path length between students not directly sharing interests."""
    # 小刚: {Python, 算法竞赛} — 小赵: {篮球, 电影}
    # They share no direct interest, but path: 小刚 -> Python -> 小明 -> 篮球 -> 小赵 (5 hops)
    path = sample_graph.find_path("小刚", "小赵")
    assert path is not None
    assert path[0] == "student:小刚"
    assert path[-1] == "student:小赵"
    # Path must exist and be >= 5 nodes
    assert len(path) >= 5

def test_find_path_private_filtering(sample_graph):
    """Test that pathfinding in Python skips private students."""
    # Without private students, there is a path from 小刚 to 小赵 (bridged by 小明)
    path = sample_graph.find_path("小刚", "小赵")
    assert path is not None

    # If "小明" is private, the path should be broken since "小明" is the only bridge from "小刚"
    path_with_private = sample_graph.find_path("小刚", "小赵", private_students={"小明"})
    assert path_with_private is None

    # If the target student "小红" is private, path to them should be blocked
    path_to_private_target = sample_graph.find_path("小明", "小红", private_students={"小红"})
    assert path_to_private_target is None

def test_connected_components(sample_graph):
    components = sample_graph.connected_components()
    # The lecture graph is fully connected
    assert len(components) == 1
    assert len(components[0]) == 20 # 6 students + 7 interests + 7 activities = 20 nodes

def test_isolated_nodes():
    g = CampusBuddyGraph()
    # Add a student with no interests (or just registering student in system)
    g.graph[g.node("student", "孤立同学")] = set()
    
    # Recommendation should be empty
    assert g.recommend_activities("孤立同学") == []
    assert g.recommend_buddies("孤立同学") == []
    assert g.recommend_buddies_ranked("孤立同学") == []
    
    # Isolated node should be its own component
    components = g.connected_components()
    assert ["student:孤立同学"] in components

def test_name_collision():
    g = CampusBuddyGraph()
    # Student named '篮球'
    g.add_student_interest("篮球", "摄影")
    # Activity named '篮球' (e.g. 篮球讲座) belongs to '摄影'
    g.add_activity_interest("篮球", "摄影")
    
    # They should not overlap because they have type prefixes
    assert g.recommend_activities("篮球") == ["篮球"]
    assert g.recommend_buddies("篮球") == []
    
    # Verify both vertices exist with prefixes
    assert "student:篮球" in g.graph
    assert "activity:篮球" in g.graph
    assert "interest:摄影" in g.graph

@pytest.mark.skipif(
    not os.path.exists("data/student_interests.csv") or not os.path.exists("data/activity_interests.csv"),
    reason="Performance test CSV files not found. Generate mock data first."
)
def test_large_scale_performance():
    import time
    
    g = CampusBuddyGraph()
    student_csv = "data/student_interests.csv"
    activity_csv = "data/activity_interests.csv"
    
    # Assert data exists
    assert os.path.exists(student_csv)
    assert os.path.exists(activity_csv)
    
    g.load_students_from_csv(student_csv)
    g.load_activities_from_csv(activity_csv)
    
    # Assert graph loaded correctly (at least 1000 students)
    students = [n for n in g.graph if n.startswith("student:")]
    assert len(students) >= 1000
    
    # Measure latency of recommendation for a valid student
    sample_student = students[0].removeprefix("student:")
    
    start_time = time.perf_counter()
    buddies = g.recommend_buddies(sample_student)
    end_time = time.perf_counter()
    
    elapsed_ms = (end_time - start_time) * 1000
    print(f"\n[Performance] 2-hop buddy recommendation for '{sample_student}' took {elapsed_ms:.4f} ms.")
    
    # Latency should be strictly less than 5 milliseconds
    assert elapsed_ms < 5.0

    # Also test Jaccard ranked recommendation performance
    start_time2 = time.perf_counter()
    ranked = g.recommend_buddies_ranked(sample_student)
    end_time2 = time.perf_counter()

    elapsed_ms2 = (end_time2 - start_time2) * 1000
    print(f"[Performance] Jaccard-ranked buddy recommendation for '{sample_student}' took {elapsed_ms2:.4f} ms.")

    # Jaccard ranking should also complete within 50ms even on large graphs
    assert elapsed_ms2 < 50.0

    # Test BFS shortest path performance
    if len(students) >= 2:
        student_a = students[0].removeprefix("student:")
        student_b = students[10].removeprefix("student:")
        start_time3 = time.perf_counter()
        path = g.find_path(student_a, student_b)
        end_time3 = time.perf_counter()
        elapsed_ms3 = (end_time3 - start_time3) * 1000
        print(f"[Performance] BFS find_path from '{student_a}' to '{student_b}' took {elapsed_ms3:.4f} ms. Path length: {len(path) if path else 'None'}")
        assert elapsed_ms3 < 200.0

def test_no_matching_activities():
    g = CampusBuddyGraph()
    g.add_student_interest("学生A", "古董鉴定")
    g.add_activity_interest("高数沙龙", "高数")
    assert g.recommend_activities("学生A") == []

def test_no_matching_buddies():
    g = CampusBuddyGraph()
    g.add_student_interest("学生A", "古玩")
    g.add_student_interest("学生B", "高数")
    assert g.recommend_buddies("学生A") == []
    assert g.recommend_buddies_ranked("学生A") == []

def test_find_path_nonexistent_student():
    g = CampusBuddyGraph()
    g.add_student_interest("学生A", "篮球")
    assert g.find_path("学生A", "不存在的学生") is None
    assert g.find_path("不存在的学生", "学生A") is None

def test_csv_parsing(tmp_path):
    student_file = tmp_path / "students.csv"
    activity_file = tmp_path / "activities.csv"
    registration_file = tmp_path / "registrations.csv"
    
    student_file.write_text("student,interest\n测试学生,篮球\n", encoding="utf-8")
    activity_file.write_text("activity,interest\n篮球挑战赛,篮球\n", encoding="utf-8")
    registration_file.write_text("student,activity\n测试学生,篮球挑战赛\n", encoding="utf-8")
    
    g = CampusBuddyGraph()
    g.load_students_from_csv(str(student_file))
    g.load_activities_from_csv(str(activity_file))
    g.load_registrations_from_csv(str(registration_file))
    
    assert "student:测试学生" in g.graph
    assert "interest:篮球" in g.graph
    assert "activity:篮球挑战赛" in g.graph
    assert "activity:篮球挑战赛" in g.graph["student:测试学生"]

def test_edge_idempotency():
    g = CampusBuddyGraph()
    g.add_student_interest("学生A", "篮球")
    g.add_student_interest("学生A", "篮球")
    assert len(g.graph["student:学生A"]) == 1
    assert len(g.graph["interest:篮球"]) == 1

def test_multiple_connected_components():
    g = CampusBuddyGraph()
    g.add_student_interest("学生A", "篮球")
    g.add_student_interest("学生B", "绘画")
    components = g.connected_components()
    assert len(components) == 2

def test_recommendations_with_paths_and_report(tmp_path):
    g = CampusBuddyGraph()
    # Add student interest with levels
    g.add_student_interest("测试学生", "Python", level=5)
    g.add_student_interest("测试学生", "篮球", level=2)
    # Add activities with capacity and time_slots
    g.add_activity_interest("Python基础班", "Python", capacity=15, time_slot="周一晚")
    g.add_activity_interest("深夜街球赛", "篮球", capacity=10, time_slot="周五晚")
    
    # 1. Test recommendations with paths
    recs = g.get_activity_recommendations_with_paths("测试学生")
    assert len(recs) == 2
    # Verify sorting: Python (level 5) comes first
    assert recs[0]["activity"] == "Python基础班"
    assert recs[0]["level"] == 5
    assert recs[0]["capacity"] == 15
    assert recs[0]["time_slot"] == "周一晚"
    assert "Python基础班" in recs[0]["path"]
    
    assert recs[1]["activity"] == "深夜街球赛"
    assert recs[1]["level"] == 2
    
    # 2. Test markdown report generation
    report_file = tmp_path / "report.md"
    report = g.export_recommendation_report("测试学生", str(report_file))
    
    # Verify file is created and has valid markdown
    assert report_file.exists()
    file_content = report_file.read_text(encoding="utf-8")
    assert "# 🧭 Campus Buddy 个性化校园推荐报告 — 测试学生" in file_content
    assert "Python基础班" in file_content
    assert "深夜街球赛" in file_content
    assert "周一晚" in file_content
    assert "15 人" in file_content

def test_jaccard_similarity_private_and_social():
    g = CampusBuddyGraph()
    # A has interests: 篮球, 摄影
    g.add_student_interest("学生A", "篮球")
    g.add_student_interest("学生A", "摄影")

    # B has interests: 篮球, 摄影 (Jaccard = 1.0)
    g.add_student_interest("学生B", "篮球")
    g.add_student_interest("学生B", "摄影")

    # C has interests: 篮球 (Jaccard = 0.5)
    g.add_student_interest("学生C", "篮球")

    # D has interests: 篮球 (Jaccard = 0.5)
    g.add_student_interest("学生D", "篮球")

    # 1. Base case: no private, no social
    res = g.recommend_buddies_ranked("学生A")
    # Expected: B (1.0), C (0.5), D (0.5)
    names = [x[0] for x in res]
    assert names == ["学生B", "学生C", "学生D"]
    assert abs(res[0][1] - 1.0) < 1e-5
    assert abs(res[1][1] - 0.5) < 1e-5

    # 2. Private student filtering: exclude B
    res_private = g.recommend_buddies_ranked("学生A", private_students={"学生B"})
    names_private = [x[0] for x in res_private]
    assert "学生B" not in names_private
    assert names_private == ["学生C", "学生D"]

    # 3. Social boost: C is social, Jaccard gets multiplied by 1.3 -> 0.5 * 1.3 = 0.65
    res_social = g.recommend_buddies_ranked("学生A", social_students={"学生C"})
    # Expected ranking order: B (1.0), C (0.65), D (0.5)
    assert res_social[0][0] == "学生B"
    assert res_social[1][0] == "学生C"
    assert abs(res_social[1][1] - 0.65) < 1e-5
    assert res_social[2][0] == "学生D"

    # 4. Social boost with perfect score capping: B is social, 1.0 * 1.3 = 1.3, capped to 1.0
    res_social_b = g.recommend_buddies_ranked("学生A", social_students={"学生B"})
    assert res_social_b[0][0] == "学生B"
    assert abs(res_social_b[0][1] - 1.0) < 1e-5

