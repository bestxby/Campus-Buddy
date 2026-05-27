import csv
import json
import os

def export_data():
    student_csv = "data/student_interests.csv"
    activity_csv = "data/activity_interests.csv"
    registration_csv = "data/student_registrations.csv"
    
    if not os.path.exists(student_csv) or not os.path.exists(activity_csv):
        print("Error: Mock CSV data not found. Please run 'python generate_mock_data.py' first.")
        return

    student_interests = []
    with open(student_csv, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header
        for row in reader:
            if row and len(row) >= 2:
                student_interests.append([row[0].strip(), row[1].strip()])

    activities = []
    with open(activity_csv, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header
        for row in reader:
            if row and len(row) >= 2:
                activities.append([row[0].strip(), row[1].strip()])

    registrations = []
    if os.path.exists(registration_csv):
        with open(registration_csv, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)  # skip header
            for row in reader:
                if row and len(row) >= 2:
                    registrations.append([row[0].strip(), row[1].strip()])

    data = {
        "students": student_interests,
        "activities": activities,
        "registrations": registrations
    }

    output_dir = "frontend/public"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "graph_data.json")
    
    with open(output_file, mode="w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(student_interests)} student-interests, {len(activities)} activity-interests, and {len(registrations)} registrations to '{output_file}'.")

if __name__ == "__main__":
    export_data()
