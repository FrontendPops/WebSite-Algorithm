import { createWalls } from "./createMaze.js";
import { containerWidth, state, colors, flag } from "./constants.js";
import { findWayAlgorithm } from "./algorithmFindWay.js"

const startPoint = (matrixSize, matrixContainer, state, flag, array, start) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickGreen) {
                cellDiv.style.backgroundColor = colors.greenColor;
                state.currentGreenCell = cellDiv;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                array[rowIndex][colIndex] = 2;
                flag.countClickGreen = false;
                start.x = rowIndex;
                start.y = colIndex;
            }
        });
    });
    flag.startPointClicked = true;
}

const endPoint = (matrixSize, matrixContainer, state, flag, array, end) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickRed) {
                cellDiv.style.backgroundColor = colors.redColor;
                state.currentRedCell = cellDiv;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                array[rowIndex][colIndex] = 3;
                flag.countClickRed = false;
                end.x = rowIndex;
                end.y = colIndex;
            }
        });
    });
    flag.endPointClicked = true;
}

const cellColorChange = (matrixSize, maze, sizeSquare, matrixContainer, state, flag) => {
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.style.width = `${sizeSquare}px`;
            cellDiv.style.height = `${sizeSquare}px`;

            cellDiv.style.backgroundColor = maze[i][j] === 1 ? colors.blackColor : colors.whiteColor;

            const leftPos = sizeSquare * j;
            const topPos = sizeSquare * i;

            cellDiv.style.left = `${leftPos}px`;
            cellDiv.style.top = `${topPos}px`;

            cellDiv.addEventListener('click', function (event) {
                if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    maze[i][j] = 0;
                } else if (cellDiv.style.backgroundColor === 'rgb(0, 255, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    maze[i][j] = 0;
                    state.currentGreenCell = null;
                    flag.countClickGreen = true;
                } else if (cellDiv.style.backgroundColor === 'rgb(255, 0, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    maze[i][j] = 0;
                    state.currentRedCell = null;
                    flag.countClickRed = true;
                } else {
                    cellDiv.style.backgroundColor = colors.blackColor;
                    maze[i][j] = 1;
                }
                event.stopPropagation();
            });
            matrixContainer.appendChild(cellDiv);
        }
    }
};

const finalyChangeColor = (matrixSize, matrixContainer, x, y) => {
    clearPreviousPath(matrixContainer);
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    let delay = 13;
    for (let i = 0; i < cellDivs.length; i++) {
        const cellDiv = cellDivs[i];
        const cellX = i % matrixSize;
        const cellY = Math.floor(i / matrixSize);

        setTimeout(() => {
            if (cellX === y && cellY === x) {
                cellDiv.style.backgroundColor = colors.pinkColor;
            }
        }, delay);
        delay += 13;
    }
}

const clearPreviousPath = (matrixContainer) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');

    for (let i = 0; i < cellDivs.length; i++) {
        const cellDiv = cellDivs[i];
        if (cellDiv.style.backgroundColor === colors.pinkColor || cellDiv.style.backgroundColor === colors.lemonColor ||
            cellDiv.style.backgroundColor === colors.greenColor || cellDiv.style.backgroundColor === colors.redColor) {
            cellDiv.style.backgroundColor = colors.whiteColor;
        }
    }
};

const createMaze = () => {
    document.getElementById("startPoint").removeEventListener("click", startPoint);
    document.getElementById("endPoint").removeEventListener("click", endPoint);
    document.getElementById("findWay").removeEventListener("click", endPoint);

    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };

    flag.startPointClicked = false;
    flag.endPointClicked = false;
    flag.countClickGreen = true;
    flag.countClickRed = true;
    state.currentGreenCell = null;
    state.currentRedCell = null;

    const matrixSize = parseInt(document.getElementById("matrixSize").value);
    const sizeSquare = containerWidth / matrixSize;

    const matrixContainer = document.getElementById('container');

    matrixContainer.innerHTML = '';
    let maze = [];
    maze = createWalls(matrixSize);

    cellColorChange(matrixSize, maze, sizeSquare, matrixContainer, state, flag);

    const startEvent = (event) => {
        if (!flag.startPointClicked) {
            let cellDiv = event.target;
            let index = Array.from(cellDiv.parentNode.children).indexOf(cellDiv);
            if (state.currentGreenCell === null && flag.countClickGreen) {
                startPoint(matrixSize, matrixContainer, state, flag, maze, start, index);
            } else {
                cellDiv.style.backgroundColor = colors.whiteColor;
                state.currentGreenCell = null;
                flag.countClickGreen = true;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                maze[rowIndex][colIndex] = 0;
            }
        }
        document.getElementById("startPoint").removeEventListener("click", startEvent);
    }

    const endEvent = (event) => {
        if (!flag.endPointClicked) {
            let cellDiv = event.target;
            let index = Array.from(cellDiv.parentNode.children).indexOf(cellDiv);
            if (state.currentRedCell === null && flag.countClickRed) {
                endPoint(matrixSize, matrixContainer, state, flag, maze, end, index);
            } else {
                cellDiv.style.backgroundColor = colors.whiteColor;
                state.currentRedCell = null;
                flag.countClickRed = true;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                maze[rowIndex][colIndex] = 0;
            }
        }
        document.getElementById("endPoint").removeEventListener("click", endEvent);
    }

    const findEvent = () => {
        let way = [];
        if (!flag.countClickRed && !flag.countClickGreen) {
            way = findWayAlgorithm(matrixSize, maze, matrixContainer, start, end);

            for (let i = 1; i < way.length - 1; i++) {
                finalyChangeColor(matrixSize, matrixContainer, way[i].x, way[i].y);
            }
        }
        way = [];
        document.getElementById("findWay").removeEventListener("click", findEvent);
    }

    document.getElementById("startPoint").addEventListener("click", startEvent);

    document.getElementById("endPoint").addEventListener("click", endEvent);

    document.getElementById("findWay").addEventListener("click", findEvent);
}

document.getElementById("create").addEventListener("click", createMaze);
