import os
import re

def replace_in_file(file_path, replacements):
    try:
        # Check if file is binary
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            if b'\0' in chunk:
                return # Skip binary
        
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            
    except Exception as e:
        print(f"Error in {file_path}: {e}")

def main():
    replacements = [
        (r'Kidpen', 'Kidpen'),
        (r'kidpen', 'kidpen'),
        (r'KIDPEN', 'KIDPEN')
    ]
    
    exclude_dirs = {'.git', 'node_modules', '.next', '.venv'}
    
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = os.path.join(root, file)
            replace_in_file(file_path, replacements)

if __name__ == "__main__":
    main()
