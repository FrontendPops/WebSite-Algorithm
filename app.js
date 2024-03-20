document.getElementById("button").addEventListener("click", function() {
    const matrixSize = parseInt(document.getElementById("matrixSize").value);
    const containerWidth = 500;
    const containerHeight = 500;
    const sizeSquare = containerWidth / matrixSize;

    const matrixContainer = document.getElementById('container');
    matrixContainer.innerHTML = '';
    matrixArray = [];

    const maze = generateMaze(matrixSize);

    for (let i = 0; i < matrixSize; i++) {
        let rowArray = [];
        for (let j = 0; j < matrixSize; j++) {
            rowArray.push(0);
            const cellDiv = createCellDiv(i, j, matrixSize, sizeSquare, maze[i][j]); // Pass maze[i][j] to determine cell type
            matrixContainer.appendChild(cellDiv);

            cellDiv.addEventListener('click', function() {
                if (cellDiv.style.backgroundColor === 'rgb(128, 128, 128)') {
                    cellDiv.style.backgroundColor = '#FFFFFF';
                    rowArray[j] = 0;
                } else {
                    cellDiv.style.backgroundColor = '#808080';
                    rowArray[j] = 1;
                }
            });
        }
        matrixArray.push(rowArray);
    }

    matrixContainer.style.width = containerWidth + 'px';
    matrixContainer.style.height = containerHeight + 'px';
});

function generateMaze(matrixSize) {
    const maze = [];

    // Initialize maze array
    for (let i = 0; i < matrixSize; i++) {
        maze[i] = [];
        for (let j = 0; j < matrixSize; j++) {
            maze[i][j] = Math.random() < 0.5 ? 1 : 0; // Randomly assign 1 (wall) or 0 (passage)
        }
    }

    // Carve passages in the maze using recursive backtracking
    function carvePassages(x, y) {
        maze[x][y] = 0; // Mark current cell as visited

        // Define directions (N, S, E, W)
        const dirs = [[-1, 0], [1, 0], [0, 1], [0, -1]];

        // Shuffle directions randomly
        dirs.sort(() => Math.random() - 0.5);

        // Iterate over shuffled directions
        for (let dir of dirs) {
            const [dx, dy] = dir;
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            // Check if the next cell is within bounds and unvisited
            if (nx >= 0 && nx < matrixSize && ny >= 0 && ny < matrixSize && maze[nx][ny] === 1) {
                maze[x + dx][y + dy] = 0; // Carve passage between current cell and next cell
                carvePassages(nx, ny); // Recursively explore next cell
            }
        }
    }

    // Start maze generation from a random cell
    const startX = Math.floor(Math.random() * Math.floor(matrixSize / 2)) * 2 + 1;
    const startY = Math.floor(Math.random() * Math.floor(matrixSize / 2)) * 2 + 1;
    carvePassages(startX, startY);

    return maze;
}

// Function to create a cell div element
function createCellDiv(i, j, matrixSize, sizeSquare, cellType) {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.style.width = sizeSquare + 'px';
    cellDiv.style.height = sizeSquare + 'px';
    
    // Set initial background color based on cell type
    cellDiv.style.backgroundColor = cellType === 1 ? '#808080' : '#FFFFFF';
    
    cellDiv.style.margin = '0';
    cellDiv.style.position = 'absolute';

    const leftPos = sizeSquare * j;
    const topPos = sizeSquare * i;

    cellDiv.style.left = leftPos + 'px';
    cellDiv.style.top = topPos + 'px';

    return cellDiv;
}