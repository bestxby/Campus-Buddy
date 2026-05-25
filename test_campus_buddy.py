import pytest
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

def test_large_scale_performance():
    import time
    import os
    
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
