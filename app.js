document.getElementById("button").addEventListener("click", function() {
    const matrixSize = parseInt(document.getElementById("matrixSize").value);
    const sizeSquare = containerWidth / matrixSize;

    const matrixContainer = document.getElementById('container');
    matrixContainer.innerHTML = '';
    matrixArray = [];

    const maze = createMaze(matrixSize);

    for (let i = 0; i < matrixSize; i++) {
        let rowArray = [];
        for (let j = 0; j < matrixSize; j++) {
            rowArray.push(0);
            const cellDiv = createCellDiv(i, j, matrixSize, sizeSquare, maze[i][j]);
            matrixContainer.appendChild(cellDiv);

            cellDiv.addEventListener('click', function() {
                if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)') {
                    cellDiv.style.backgroundColor = '#FFFFFF';
                    rowArray[j] = 0;
                } else {
                    cellDiv.style.backgroundColor = '#000000';
                    rowArray[j] = 1;
                }
            });
        }
        matrixArray.push(rowArray);
    }

    matrixContainer.style.width = containerWidth + 'px';
    matrixContainer.style.height = containerHeight + 'px';
});


function createMaze(matrixSize) {
    const width = matrixSize * 2 + 1;
    const height = matrixSize * 2 + 1;
    const maze = [];

    for (let i = 0; i < width; i++) {
        maze[i] = [];
        for (let j = 0; j < height; j++) {
            maze[i][j] = 1;
        }
    }
    
    let x = Math.floor(Math.random() * Math.floor(width / 2)) * 2 + 1;
    let y = Math.floor(Math.random() * Math.floor(height / 2)) * 2 + 1;
    maze[x][y] = 0;
    const stack = [{ x, y }];

    while (stack.length > 0) {
        const current = stack.pop();
        x = current.x;
        y = current.y;

        const directions = shuffleDirections();
        for (let dir of directions) {
            const [dx, dy] = dir;
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx > 0 && nx < width && ny > 0 && ny < height && maze[nx][ny] === 1) {
                maze[nx][ny] = 0;
                maze[(x + nx) / 2][(y + ny) / 2] = 0;
                stack.push({ x: nx, y: ny });
            }
        }
    }

    return maze; 
}

function createCellDiv(i, j, matrixSize, sizeSquare, cellType) {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.style.width = `${sizeSquare}px`; 
    cellDiv.style.height = `${sizeSquare}px`;
    
    cellDiv.style.backgroundColor = cellType === 1 ? '#000000' : '#FFFFFF';

    const leftPos = sizeSquare * j;
    const topPos = sizeSquare * i;

    cellDiv.style.left = leftPos + 'px';
    cellDiv.style.top = topPos + 'px';

    return cellDiv;
}

function shuffleDirections() {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    return directions;
}