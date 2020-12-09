# frontm8er

Quick and dirty tool to add data to your markdown files.

## Usage examples

```sh
npm i frontm8er -g

# Adds author field for every markdown file
frontm8er --author="Lea Rosema" content/*.md

# Adds created and modified time and author field for every markdown file
frontm8er -c -m --author="Lea Rosema" content/*.md

# Pulls data from json file and adds it to the markdown file
frontm8er data.json content/*.md
```