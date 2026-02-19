import os

def main():
    input_filepath = 'temp_html.html'
    output_filepath = 'src/html.ts'

    if not os.path.exists(input_filepath):
        print(f"Input file {input_filepath} not found")
        return

    with open(input_filepath, 'r') as f:
        content = f.read()

    # Escape backslashes (must be first)
    content = content.replace('\\', '\\\\')

    # Escape backticks
    content = content.replace('`', '\\`')

    # Escape template interpolation start
    content = content.replace('${', '\\${')

    # Wrap
    final_content = 'export const html = `' + content + '`;'

    with open(output_filepath, 'w') as f:
        f.write(final_content)
    print(f"Converted {input_filepath} to {output_filepath}")

if __name__ == '__main__':
    main()
