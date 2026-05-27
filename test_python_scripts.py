from unittest.mock import patch, mock_open
import json
import generate_mock_data
import export_graph_to_json

def test_generate_mock_data():
    with patch("builtins.open", mock_open()) as mock_file, \
         patch("os.makedirs") as mock_makedirs:
        generate_mock_data.generate_data()
        
        # Verify it tries to create the directory
        mock_makedirs.assert_called_once_with("data", exist_ok=True)
        
        # Verify it opened the files for writing
        assert mock_file.call_count == 3
        # Check files were opened in write mode with utf-8 encoding
        mock_file.assert_any_call("data/student_interests.csv", mode="w", encoding="utf-8", newline="")
        mock_file.assert_any_call("data/activity_interests.csv", mode="w", encoding="utf-8", newline="")
        mock_file.assert_any_call("data/student_registrations.csv", mode="w", encoding="utf-8", newline="")

def test_export_graph_to_json():
    # Mock data to return when reading CSVs
    student_csv_data = "student,interest\n张三,篮球\n李四,Python\n"
    activity_csv_data = "activity,interest\n篮球新手入门交流会,篮球\n"
    registration_csv_data = "student,activity\n张三,篮球新手入门交流会\n"

    # We want to patch os.path.exists to return True
    # And builtins.open to return custom data depending on the path
    def side_effect_open(path, *args, **kwargs):
        if "student_interests.csv" in path:
            return mock_open(read_data=student_csv_data).return_value
        elif "activity_interests.csv" in path:
            return mock_open(read_data=activity_csv_data).return_value
        elif "student_registrations.csv" in path:
            return mock_open(read_data=registration_csv_data).return_value
        else:
            # For writing the JSON output file
            return mock_open().return_value

    with patch("os.path.exists", return_value=True), \
         patch("os.makedirs"), \
         patch("builtins.open", side_effect=side_effect_open) as mock_file, \
         patch("json.dump") as mock_json_dump:
        
        export_graph_to_json.export_data()
        
        # Check that json.dump was called with correct data
        mock_json_dump.assert_called_once()
        exported_data = mock_json_dump.call_args[0][0]
        assert "students" in exported_data
        assert "activities" in exported_data
        assert "registrations" in exported_data
        
        assert exported_data["students"] == [["张三", "篮球"], ["李四", "Python"]]
        assert exported_data["activities"] == [["篮球新手入门交流会", "篮球"]]
        assert exported_data["registrations"] == [["张三", "篮球新手入门交流会"]]
