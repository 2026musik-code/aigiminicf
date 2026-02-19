import os

def main():
    filepath = 'src/html.ts'
    if not os.path.exists(filepath):
        print("File not found")
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # Escape backslashes (must be first)
    content = content.replace('\\', '\\\\')

    # Escape backticks
    content = content.replace('`', '\\`')

    # Escape template interpolation start
    content = content.replace('${', '\\${')

    # Wrap
    final_content = 'export const html = `' + content + '`;'

    with open(filepath, 'w') as f:
        f.write(final_content)
    print("Fixed src/html.ts")

if __name__ == '__main__':
    main()
