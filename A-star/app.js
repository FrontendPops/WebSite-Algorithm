import { createWalls } from "./createMaze.js";
import { containerWidth, state, colors, flag } from "./constants.js";

const createMaze = () => {
    document.getElementById("startPoint").removeEventListener("click", startPoint);
    document.getElementById("endPoint").removeEventListener("click", endPoint);

    const matrixSize = parseInt(document.getElementById("matrixSize").value);
    const sizeSquare = containerWidth / matrixSize;

    const matrixContainer = document.getElementById('container');
    matrixContainer.innerHTML = '';
    let matrixArray = [];
    let maze = createWalls(matrixSize);

    for (let i = 0; i < matrixSize; i++) {
        let rowArray = [];
        for (let j = 0; j < matrixSize; j++) {
            rowArray.push(0);
            let cellDiv = createCellDiv(i, j, sizeSquare, maze[i][j], matrixSize);
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
    document.getElementById("startPoint").addEventListener("click", function (event) {
        let cellDiv = event.target;
        if (state.currentGreenCell === null && flag.countClickGreen) {
            document.getElementById("startPoint").removeEventListener("click", startPoint);
            startPoint(matrixContainer, state, flag);
        } else {
            document.getElementById("startPoint").removeEventListener("click", startPoint);
            cellDiv.style.backgroundColor = colors.whiteColor;
            state.currentGreenCell = null;
            flag.countClickGreen = true;
        }
    });

    document.getElementById("endPoint").addEventListener("click", function (event) {
        let cellDiv = event.target;
        if (state.currentRedCell === null && flag.countClickRed) {
            endPoint(matrixContainer, state, flag);
        } else {
            cellDiv.style.backgroundColor = colors.whiteColor;
            state.currentRedCell = null;
            flag.countClickRed = true;
        }
    });
}

document.getElementById("create").addEventListener("click", createMaze);

function createCellDiv(i, j, sizeSquare, cellType) {
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

function startPoint(matrixContainer, state, flag) {
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickGreen) {
                cellDiv.style.backgroundColor = colors.greenColor;
                state.currentGreenCell = cellDiv;
                matrixContainer[index] = 2;
                flag.countClickGreen = false;
            }
        });
    });
}

function endPoint(matrixContainer, state, flag) {
    document.getElementById("startPoint").removeEventListener("click", startPoint);
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    cellDivs.forEach((cellDiv, index) => {
        cellDiv.addEventListener('click', function () {
            if (cellDiv.style.backgroundColor === 'rgb(0, 0, 0)' && flag.countClickRed) {
                cellDiv.style.backgroundColor = colors.redColor;
                state.currentRedCell = cellDiv;
                matrixContainer[index] = 3;
                flag.countClickRed = false;
            }
        });
    });
}