import os
from campus_buddy import CampusBuddyGraph

def print_banner():
    print("=" * 65)
    print("      🏫  CAMPUS BUDDY GRAPH MATCHING SYSTEM (1,000+ Scale)  🏫")
    print("=" * 65)

def suggest_similar_students(g, name, limit=5):
    """Simple suggestion helper to find names containing the search term."""
    matches = []
    for node in g.graph:
        if node.startswith("student:"):
            s_name = node.removeprefix("student:")
            if name in s_name:
                matches.append(s_name)
    return matches[:limit]

def main():
    # 1. Initialize and Load Graph
    print("Loading campus graph data...")
    g = CampusBuddyGraph()
    
    student_csv = "data/student_interests.csv"
    activity_csv = "data/activity_interests.csv"
    
    if not os.path.exists(student_csv) or not os.path.exists(activity_csv):
        print("Error: Mock data CSV files not found. Please run 'python generate_mock_data.py' first.")
        return

    g.load_students_from_csv(student_csv)
    g.load_activities_from_csv(activity_csv)
    print("Graph loaded successfully!")
    
    while True:
        print_banner()
        print("  [1] Recommend Activities for a Student")
        print("  [2] Recommend Buddies for a Student")
        print("  [3] Search Student's Registered Interests")
        print("  [4] Show Graph Statistics & Communities")
        print("  [5] Register a Student's Interest Live")
        print("  [6] Register an Activity to an Interest Live")
        print("  [7] Export Personalized Markdown Report")
        print("  [8] Exit")
        print("=" * 65)
        
        choice = input("Enter choice (1-8): ").strip()
        
        if choice == "1":
            name = input("Enter student name: ").strip()
            node_key = g.node("student", name)
            if node_key not in g.graph:
                print(f"\n❌ Student '{name}' not found.")
                suggestions = suggest_similar_students(g, name)
                if suggestions:
                    print(f"💡 Did you mean: {', '.join(suggestions)}?")
                continue
            
            activities = g.recommend_activities(name)
            print(f"\n✨ Recommended activities for '{name}':")
            if activities:
                for idx, act in enumerate(activities, 1):
                    print(f"  {idx}. {act}")
            else:
                print("  No matching activities found for this student's interests.")

        elif choice == "2":
            name = input("Enter student name: ").strip()
            node_key = g.node("student", name)
            if node_key not in g.graph:
                print(f"\n❌ Student '{name}' not found.")
                suggestions = suggest_similar_students(g, name)
                if suggestions:
                    print(f"💡 Did you mean: {', '.join(suggestions)}?")
                continue
            
            buddies = g.recommend_buddies(name)
            print(f"\n🤝 Recommended buddies for '{name}':")
            if buddies:
                for idx, buddy in enumerate(buddies, 1):
                    print(f"  {idx}. {buddy}")
            else:
                print("  No buddies found sharing the same interests.")

        elif choice == "3":
            name = input("Enter student name: ").strip()
            node_key = g.node("student", name)
            if node_key not in g.graph:
                print(f"\n❌ Student '{name}' not found.")
                suggestions = suggest_similar_students(g, name)
                if suggestions:
                    print(f"💡 Did you mean: {', '.join(suggestions)}?")
                continue
            
            interests = [n.removeprefix("interest:") for n in g.graph[node_key] if n.startswith("interest:")]
            print(f"\n🎯 Registered interests for '{name}':")
            for idx, inter in enumerate(sorted(interests), 1):
                print(f"  {idx}. {inter}")

        elif choice == "4":
            students = [n for n in g.graph if n.startswith("student:")]
            interests = [n for n in g.graph if n.startswith("interest:")]
            activities = [n for n in g.graph if n.startswith("activity:")]
            
            print("\n📊 Graph Size Statistics:")
            print(f"  - Total student nodes: {len(students)}")
            print(f"  - Total interest nodes: {len(interests)}")
            print(f"  - Total activity nodes: {len(activities)}")
            
            print("\n🕵️ Community detection (Connected Components):")
            components = g.connected_components()
            print(f"  - Number of isolated communities (components): {len(components)}")
            for idx, comp in enumerate(components, 1):
                c_students = [n for n in comp if n.startswith("student:")]
                c_activities = [n for n in comp if n.startswith("activity:")]
                if idx <= 5: # Limit printing to first 5 components
                    print(f"  - Community {idx}: {len(comp)} nodes total ({len(c_students)} students, {len(c_activities)} activities)")
            if len(components) > 5:
                print(f"    ... ({len(components) - 5} more communities)")

        elif choice == "5":
            student = input("Enter student name: ").strip()
            interest = input("Enter interest name: ").strip()
            if not student or not interest:
                print("❌ Invalid input.")
                continue
            g.add_student_interest(student, interest)
            print(f"\n✅ Registered: '{student}' is now interested in '{interest}'!")

        elif choice == "6":
            activity = input("Enter activity name: ").strip()
            interest = input("Enter interest name: ").strip()
            if not activity or not interest:
                print("❌ Invalid input.")
                continue
            g.add_activity_interest(activity, interest)
            print(f"\n✅ Registered: Activity '{activity}' is now linked to '{interest}'!")

        elif choice == "7":
            name = input("Enter student name: ").strip()
            node_key = g.node("student", name)
            if node_key not in g.graph:
                print(f"\n❌ Student '{name}' not found.")
                suggestions = suggest_similar_students(g, name)
                if suggestions:
                    print(f"💡 Did you mean: {', '.join(suggestions)}?")
                continue
            
            output_dir = "data/reports"
            os.makedirs(output_dir, exist_ok=True)
            file_path = os.path.join(output_dir, f"{name}_recommendation_report.md")
            
            try:
                g.export_recommendation_report(name, file_path)
                print(f"\n✅ Report generated successfully and exported to:")
                print(f"  👉 {file_path}")
            except Exception as e:
                print(f"\n❌ Failed to export report: {e}")

        elif choice == "8":
            print("\nGoodbye! Thank you for using Campus Buddy.")
            break
            
        else:
            print("\n❌ Invalid choice. Please select 1-8.")
            
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
