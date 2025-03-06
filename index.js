const terminal = document.getElementById("terminal");
const user = "root";
const host = "sakerhetspolisen";
let currentDirectory = "~";

// Simulated file system
const fileSystem = {
    "~": ["Desktop", "Documents", "Downloads", "Pictures", "Music"],
    "~/Documents": [],
    "~/Downloads": [],
    "~/Pictures": [],
    "~/Music": [],
    "~/Desktop": []
};
const fileContents = {}; // Stores file contents

// ASCII Art for simonnilsson.dev
const asciiArt = `
███████ ██ ███    ███  ██████  ███    ██ ███    ██ ██ ██      ███████ ███████  ██████  ███    ██    ██████  ███████ ██    ██     
██      ██ ████  ████ ██    ██ ████   ██ ████   ██ ██ ██      ██      ██      ██    ██ ████   ██    ██   ██ ██      ██    ██     
███████ ██ ██ ████ ██ ██    ██ ██ ██  ██ ██ ██  ██ ██ ██      ███████ ███████ ██    ██ ██ ██  ██    ██   ██ █████   ██    ██     
     ██ ██ ██  ██  ██ ██    ██ ██  ██ ██ ██  ██ ██ ██ ██           ██      ██ ██    ██ ██  ██ ██    ██   ██ ██       ██  ██      
███████ ██ ██      ██  ██████  ██   ████ ██   ████ ██ ███████ ███████ ███████  ██████  ██   ████ ██ ██████  ███████   ████                                                                                                                   
    `;
    
// Show ASCII art on page load
function showAsciiArt() {
    let outputLine = document.createElement("div");
    outputLine.className = "ascii-art";
    outputLine.textContent = asciiArt;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight;  // Scroll to bottom
}

function createInputLine() {
    let inputLine = document.createElement("div");
    inputLine.className = "input-line";
    inputLine.innerHTML = `<span class="prompt">${user}@${host}:${currentDirectory}$</span> <input type="text" autofocus>`;
    terminal.appendChild(inputLine);
            
    let inputField = inputLine.querySelector("input");
    inputField.focus();

    inputField.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            processCommand(inputField.value);
            inputField.disabled = true;
            createInputLine();
        }
    });

    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(command) {
    let output = "";
    let args = command.trim().split(" ");
    let cmd = args[0];

    switch (cmd) {
        case "pwd":
            output = currentDirectory;
            break;

        case "ls":
            output = fileSystem[currentDirectory] ? fileSystem[currentDirectory].join("  ") : "";
            break;

        case "echo":
            output = args.slice(1).join(" ");
            break;

        case "clear":
            terminal.innerHTML = "";
            showAsciiArt();
            createInputLine();
            return;

        case "help":
            output = `Available commands:\n pwd - Show current directory\n ls - List files\n cd [dir] - Change directory\n touch [file] - Create file\n nano [file] - Edit file\n cat [file] - View file\n echo [text] - Print text\n clear - Clear screen\n help - Show this message`;
            break;

        case "cd":
            if (args.length < 2) {
                output = "cd: missing argument";
            } else {
                let targetDir = args[1];

                if (targetDir === "..") {
                    if (currentDirectory !== "~") {
                        let parts = currentDirectory.split("/");
                        parts.pop();
                        currentDirectory = parts.length > 1 ? parts.join("/") : "~";
                    }
                } else if (fileSystem[currentDirectory].includes(targetDir)) {
                    currentDirectory = currentDirectory === "~" ? `~/${targetDir}` : `${currentDirectory}/${targetDir}`;
                } else {
                    output = `cd: ${targetDir}: No such file or directory`;
                }
            }
            break;

        case "touch":
            if (args.length < 2) {
                output = "touch: missing filename";
            } else {
                let filename = args[1];
                if (!fileSystem[currentDirectory].includes(filename)) {
                    fileSystem[currentDirectory].push(filename);
                    fileContents[`${currentDirectory}/${filename}`] = "";
                }
            }
            break;

        case "cat":
            if (args.length < 2) {
                output = "cat: missing filename";
            } else {
                let filename = args[1];
                let fullPath = `${currentDirectory}/${filename}`;
                if (fileSystem[currentDirectory].includes(filename)) {
                    output = fileContents[fullPath] || "";
                } else {
                    output = `cat: ${filename}: No such file`;
                }
            }
            break;

        case "nano":
            if (args.length < 2) {
                output = "nano: missing filename";
            } else {
                let filename = args[1];
                let fullPath = `${currentDirectory}/${filename}`;
                if (!fileSystem[currentDirectory].includes(filename)) {
                    fileSystem[currentDirectory].push(filename);
                    fileContents[fullPath] = "";
                }
                openEditor(fullPath);
                return;
            }
            break;

        case "":
            output = "";
            break;

        default:
            output = `${cmd}: command not found`;
            break;
    }

    let outputLine = document.createElement("div");
    outputLine.textContent = output;
    terminal.appendChild(outputLine);
}

function openEditor(filePath) {
    let editorDiv = document.createElement("div");
    editorDiv.className = "editor";

    let editorHeader = document.createElement("div");
    editorHeader.textContent = `Editing: ${filePath}`;
    editorDiv.appendChild(editorHeader);

    let textArea = document.createElement("textarea");
    textArea.value = fileContents[filePath] || "";
    editorDiv.appendChild(textArea);

    let saveButton = document.createElement("button");
    saveButton.textContent = "Save & Exit";
    saveButton.onclick = function () {
        fileContents[filePath] = textArea.value;
        terminal.removeChild(editorDiv);
        createInputLine();
    };
    editorDiv.appendChild(saveButton);

    terminal.appendChild(editorDiv);
    textArea.focus();
}

document.addEventListener("click", function () {
    let inputs = document.querySelectorAll("input");
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
});

// Initialize terminal with ASCII art
showAsciiArt();
createInputLine();