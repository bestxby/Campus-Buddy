import csv
import random
import os

def generate_data():
    # Seed the random number generator for stable, reproducible mock data generation
    random.seed(42)
    
    # Pools of Chinese surnames and given names
    surnames = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "严"]
    given_names = ["强", "伟", "华", "平", "芳", "娜", "明", "刚", "杰", "娟", "艳", "勇", "军", "磊", "洋", "斌", "霞", "敏", "静", "丽", "涛", "超", "莉", "杰"]

    # 30 diverse campus interests grouped by category (Sports: 7, Arts: 8, Tech: 8, Social: 7)
    sports_interests = ["篮球", "足球", "羽毛球", "网球", "游泳", "乒乓球", "排球"]
    arts_interests = ["摄影", "读书", "电影", "音乐", "绘画", "棋类", "桌游", "书法"]
    tech_interests = ["Python", "Web开发", "机器学习", "算法竞赛", "网络安全", "Linux", "硬件DIY", "物联网"]
    social_interests = ["志愿服务", "英语角", "户外探索", "辩论社", "公益支教", "求职沙龙", "旅行搭子"]
    
    interests = sports_interests + arts_interests + tech_interests + social_interests

    # Generate 1,499 unique student names
    students = set()
    while len(students) < 1499:
        if random.random() > 0.3:
            name = random.choice(surnames) + random.choice(given_names) + random.choice(given_names)
        else:
            name = random.choice(surnames) + random.choice(given_names)
        students.add(name)

    students = sorted(list(students))

    # Activity templates per interest to generate exactly 100 unique activities
    # 10 interests * 4 templates = 40 activities
    # 20 interests * 3 templates = 60 activities
    # Total = 100 activities
    templates_4 = [
        "{}新手入门交流会",
        "{}周末挑战赛",
        "校队{}公开选拔赛",
        "{}户外沙龙联谊"
    ]
    templates_3 = [
        "{}进阶分享交流沙龙",
        "{}狂欢狂热大集会",
        "{}专题知识讲座"
    ]

    # Ensure output directory exists
    os.makedirs("data", exist_ok=True)

    # 1. Generate student interests (each student gets 2 to 4 random interests)
    student_interest_rows = []
    student_to_interests = {}
    for student in students:
        num_interests = random.randint(2, 4)
        selected_interests = random.sample(interests, num_interests)
        student_to_interests[student] = selected_interests
        for interest in selected_interests:
            student_interest_rows.append([student, interest])

    with open("data/student_interests.csv", mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["student", "interest"])
        writer.writerows(student_interest_rows)

    # 2. Generate activity interests
    activity_interest_rows = []
    interest_to_activities = {i: [] for i in interests}
    
    for idx, interest in enumerate(interests):
        # First 10 interests get 4 activities, remaining 20 get 3 activities -> Total 100 activities
        templates = templates_4 if idx < 10 else templates_3
        for template in templates:
            activity_name = template.format(interest)
            activity_interest_rows.append([activity_name, interest])
            interest_to_activities[interest].append(activity_name)

    with open("data/activity_interests.csv", mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["activity", "interest"])
        writer.writerows(activity_interest_rows)

    # 3. Generate student-activity registrations (social connections)
    # Each student randomly signs up for 1 or 2 activities matching their interests
    student_registration_rows = []
    for student in students:
        student_ints = student_to_interests[student]
        possible_activities = []
        for i in student_ints:
            possible_activities.extend(interest_to_activities[i])
        
        num_registrations = random.choice([0, 1, 1, 2])  # 25% chance of 0, 50% of 1, 25% of 2
        if possible_activities and num_registrations > 0:
            num_registrations = min(num_registrations, len(possible_activities))
            selected_activities = random.sample(possible_activities, num_registrations)
            for act in selected_activities:
                student_registration_rows.append([student, act])

    with open("data/student_registrations.csv", mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["student", "activity"])
        writer.writerows(student_registration_rows)

    print(f"Mock Data Generation Complete:")
    print(f"  - Generated {len(students)} unique students and {len(student_interest_rows)} student-interest edges.")
    print(f"  - Generated {len(activity_interest_rows)} unique activities (Total 30 interest types).")
    print(f"  - Generated {len(student_registration_rows)} student-activity registration edges.")
    print(f"  - Saved files to 'data/student_interests.csv', 'data/activity_interests.csv', and 'data/student_registrations.csv'.")

if __name__ == "__main__":
    generate_data()
