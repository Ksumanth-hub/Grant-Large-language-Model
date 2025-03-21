# -*- coding: utf-8 -*-
"""
Fix JSON file with invalid control characters
"""

import json
import re
import os

def fix_json_file(input_file, output_file=None):
    """
    Reads a JSON file with potential invalid control characters,
    cleans it, and saves a fixed version.
    
    Args:
        input_file (str): Path to the input JSON file
        output_file (str, optional): Path to save the fixed JSON file.
                                    If None, will use input_file + '.fixed'
    
    Returns:
        bool: True if successful, False otherwise
    """
    if output_file is None:
        output_file = input_file + '.fixed'
    
    print(f"Attempting to fix JSON file: {input_file}")
    print(f"Will save fixed file to: {output_file}")
    
    try:
        # Read the file as text
        with open(input_file, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Get the original file size
        original_size = len(content)
        print(f"Original file size: {original_size} bytes")
        
        # Clean control characters
        cleaned_content = re.sub(r'[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]', '', content)
        
        # Replace invalid newlines within strings with escaped newlines
        # This regex finds newlines between quotes that aren't already escaped
        cleaned_content = re.sub(r'(?<=")(\n)(?=[^"]*")', '\\n', cleaned_content)
        
        # Check if cleaning made a difference
        if len(cleaned_content) != original_size:
            print(f"Removed {original_size - len(cleaned_content)} invalid characters")
        
        # Validate the cleaned content
        try:
            json_data = json.loads(cleaned_content)
            print(f"Successfully parsed JSON with {len(json_data)} items")
            
            # Save the cleaned content
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            print(f"Successfully saved fixed JSON to: {output_file}")
            return True
            
        except json.JSONDecodeError as e:
            print(f"Still have JSON parse error after cleaning: {e}")
            print(f"Error at position {e.pos}, line {e.lineno}, column {e.colno}")
            
            # Get context around the error
            start = max(0, e.pos - 100)
            end = min(len(cleaned_content), e.pos + 100)
            context = cleaned_content[start:end]
            print(f"Context around error:\n{context}")
            
            # If we have a line number, try to fix just that line
            if e.lineno > 0:
                lines = cleaned_content.split('\n')
                if e.lineno <= len(lines):
                    problem_line = lines[e.lineno - 1]
                    print(f"Problem line ({e.lineno}): {problem_line}")
                    
                    # Try to manually fix common issues
                    if problem_line.count('"') % 2 == 1:
                        print("Line appears to have unmatched quotes")
                    if problem_line.strip().endswith(',') and e.colno > len(problem_line.strip()) - 1:
                        print("Line appears to have a trailing comma at the end of an object/array")
            
            return False
            
    except Exception as e:
        print(f"Error processing file: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = input("Enter the path to your JSON file: ")
    
    output_file = input_file + '.fixed.json'
    fix_json_file(input_file, output_file)