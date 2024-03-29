import { createWalls } from "./createMaze.js";
import { containerWidth, state, colors, flag } from "./constants.js";
import { findWayAlgorithm } from "./algorithmFindWay.js"

const createMaze = () => {
    document.getElementById("startPoint").removeEventListener("click", startPoint);
    document.getElementById("endPoint").removeEventListener("click", endPoint);
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
    let matrixArray = [];

    let maze = createWalls(matrixSize);

    cellColorChange(matrixSize, maze, sizeSquare, matrixArray, matrixContainer, state, flag);

    document.getElementById("startPoint").addEventListener("click", function (event) {
        document.getElementById("startPoint").removeEventListener("click", endPoint);
        if (!flag.startPointClicked) {
            let cellDiv = event.target;
            if (state.currentGreenCell === null && flag.countClickGreen) {
                startPoint(matrixSize, matrixContainer, state, flag, matrixArray);
            } else {
                cellDiv.style.backgroundColor = colors.whiteColor;
                state.currentGreenCell = null;
                flag.countClickGreen = true;
            }
        }
        flag.startPointClicked = true;
    });

    document.getElementById("endPoint").addEventListener("click", function (event) {
        if (!flag.endPointClicked) {
            let cellDiv = event.target;
            if (state.currentRedCell === null && flag.countClickRed) {
                endPoint(matrixSize, matrixContainer, state, flag, matrixArray);
            } else {
                cellDiv.style.backgroundColor = colors.whiteColor;
                state.currentRedCell = null;
                flag.countClickRed = true;
            }
        }
        flag.endPointClicked = true;
    });

    document.getElementById("findWay").addEventListener("click", function() {
        findWay(matrixArray, start, end, matrixSize, matrixContainer);
    });
}

document.getElementById("create").addEventListener("click", createMaze);


const findWay = (matrixArray, start, end, matrixSize, matrixContainer) => {
    for(let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            if (matrixArray[i][j] === 2) {
                start.x = i;
                start.y = j;
            }
            if (matrixArray[i][j] === 3) {
                end.x = i;
                end.y = j;
            }
        }
    }
    console.log(matrixArray);

    console.log(start, end);
    let findWay = findWayAlgorithm(matrixSize, matrixArray, matrixContainer);

    for (let i = 1; i < findWay.length - 1; i++) {
        finalyChangeColor(matrixSize, matrixContainer, findWay[i].x, findWay[i].y);
    }
}

const createCellDiv = (i, j, sizeSquare, cellType) => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.style.width = `${sizeSquare}px`;
    cellDiv.style.height = `${sizeSquare}px`;

    cellDiv.style.backgroundColor = cellType === 1 ? colors.blackColor : colors.whiteColor;

    const leftPos = sizeSquare * j;
    const topPos = sizeSquare * i;

    cellDiv.style.left = `${leftPos}px`;
    cellDiv.style.top = `${topPos}px`;

    return cellDiv;
}

const startPoint = (matrixSize, matrixContainer, state, flag, maze) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');

    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickGreen) {
                cellDiv.style.backgroundColor = colors.greenColor;
                state.currentGreenCell = cellDiv;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                maze[rowIndex][colIndex] = 2;
                flag.countClickGreen = false;
            }
        });
    });
}

const endPoint = (matrixSize, matrixContainer, state, flag, maze) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');

    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickRed) {
                cellDiv.style.backgroundColor = colors.redColor;
                state.currentRedCell = cellDiv;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                maze[rowIndex][colIndex] = 3;
                flag.countClickRed = false;
            }
        });
    });
}

export const cellColorChange = (matrixSize, maze, sizeSquare, matrixArray, matrixContainer, state, flag) => {
    for (let i = 0; i < matrixSize; i++) {
        let rowArray = [];
        for (let j = 0; j < matrixSize; j++) {
            rowArray.push(maze[i][j]);
            let cellDiv = createCellDiv(i, j, sizeSquare, maze[i][j]);
            matrixContainer.appendChild(cellDiv);

            cellDiv.addEventListener('click', function () {
                if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    rowArray[j] = 0;
                } else if (cellDiv.style.backgroundColor === 'rgb(0, 255, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    rowArray[j] = 0;
                    state.currentGreenCell = null;
                    flag.countClickGreen = true;
                } else if (cellDiv.style.backgroundColor === 'rgb(255, 0, 0)') {
                    cellDiv.style.backgroundColor = colors.whiteColor;
                    rowArray[j] = 0;
                    state.currentRedCell = null;
                    flag.countClickRed = true;
                } else {
                    cellDiv.style.backgroundColor = colors.blackColor;
                    rowArray[j] = 1;
                }
            });
        }
        matrixArray.push(rowArray);
    }
};

const finalyChangeColor = (matrixSize, matrixContainer, x, y) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');

    for (let i = 0; i < cellDivs.length; i++) {
        const cellDiv = cellDivs[i];
        const cellX = i % matrixSize;
        const cellY = Math.floor(i / matrixSize);

        if (cellX === y && cellY === x) {
            cellDiv.style.backgroundColor = colors.pinkColor;
            return;
        }
    }
}

export const start = {
    x: 0,
    y: 0
};

export const end = {
    x: 0,
    y: 0
};