import os
from pathlib import Path

# --- CONFIGURATION ---
# Define which directories to completely ignore to save token space
IGNORE_DIRS = {
    ".git", "__pycache__", "node_modules", "venv", ".venv", 
    "env", ".idea", ".vscode", "build", "dist"
}

# Define which file extensions you want to include in the bundle
# (Add or remove extensions based on your maritime platform stack)
INCLUDE_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".go", 
    ".sql", ".yaml", ".yml", ".json", ".env.example", ".html", ".css"
}

# Define specific file names to exclude (e.g., package locks, compiled databases)
IGNORE_FILES = {"package-lock.json", "yarn.lock", "poetry.lock"}

def build_project_bundle(root_dir_path, output_md_path):
    root_path = Path(root_dir_path).resolve()
    output_path = Path(output_md_path).resolve()
    
    print(f"Scanning directory: {root_path}")
    print("Gathering code files...")
    
    total_files = 0
    
    with open(output_path, "w", encoding="utf-8") as outfile:
        # 1. Write a Header/Context instruction for Gemini
        outfile.write("# SYSTEM ARCHITECTURE AND SOURCE CODE CONTEXT\n\n")
        outfile.write("> **INSTRUCTION FOR GEMINI:** The following document contains the entire directory structure ")
        outfile.write("and source files for an Enterprise Maritime AI platform. Use this comprehensive context ")
        outfile.write("to debug issues, maintain logical consistency across modules, and prevent logic loops.\n\n")
        
        # 2. Generate a visual directory map at the top of the file
        outfile.write("## 1. PROJECT DIRECTORY TREE\n```text\n")
        for root, dirs, files in os.walk(root_path):
            # Modify dirs in-place to skip ignored folders dynamically
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            level = len(Path(root).relative_to(root_path).parts)
            indent = "  " * level
            if root != str(root_path):
                outfile.write(f"{indent}📁 {os.path.basename(root)}/\n")
            
            sub_indent = "  " * (level + 1)
            for f in files:
                ext = Path(f).suffix.lower()
                if ext in INCLUDE_EXTENSIONS and f not in IGNORE_FILES:
                    outfile.write(f"{sub_indent}📄 {f}\n")
        outfile.write("```\n\n---\n\n")
        
        # 3. Append the content of each file with markdown wrappers
        outfile.write("## 2. SOURCE CODE FILES\n\n")
        
        for root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                ext = file_path.suffix.lower()
                
                # Check filters
                if ext in INCLUDE_EXTENSIONS and file not in IGNORE_FILES:
                    relative_path = file_path.relative_to(root_path)
                    print(f"Bundling: {relative_path}")
                    
                    # Markdown section for the file
                    outfile.write(f"### File: `{relative_path}`\n")
                    outfile.write(f"**Path:** `{file_path}`\n\n")
                    
                    # Extract extension name without dot for the markdown code block language
                    lang_tag = ext.lstrip(".")
                    if lang_tag in ["yml", "yaml"]:
                        lang_tag = "yaml"
                    
                    outfile.write(f"```{lang_tag}\n")
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="replace") as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"// Error reading file content: {str(e)}\n")
                    
                    outfile.write("\n```\n\n---\n\n")
                    total_files += 1

    print(f"\nSuccess! Bundled {total_files} files into: {output_path}")

if __name__ == "__main__":
    # Change '.' to your actual project folder path if you run this outside the directory
    PROJECT_DIR = "." 
    OUTPUT_FILE = "maritime_platform_bundle.md"
    
    build_project_bundle(PROJECT_DIR, OUTPUT_FILE)