import { createWalls } from "./createMaze.js";
import { containerWidth, state, colors, flag } from "./constants.js";
import { findWayAlgorithm } from "./algorithmFindWay.js"

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
    console.log("befor start point", array);
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
    console.log("befor end point", array);
}

export const cellColorChange = (matrixSize, maze, sizeSquare, matrixContainer, state, flag) => {
    let matrixArray = [];
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
        matrixArray[i] = rowArray;
    }
    return matrixArray;
};

const finalyChangeColor = (matrixSize, matrixContainer, x, y) => {
    const cellDivs = matrixContainer.querySelectorAll('.cell');
    let delay = 10;
    for (let i = 0; i < cellDivs.length; i++) {
        const cellDiv = cellDivs[i];
        const cellX = i % matrixSize;
        const cellY = Math.floor(i / matrixSize);

        setTimeout(() => {
            if (cellX === y && cellY === x) {
                cellDiv.style.backgroundColor = colors.pinkColor;
            }
        }, delay);
        delay += 10;
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

    console.log("start:", start.x, start.y);
    console.log("end:", end.x, end.y);


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

    let maze = createWalls(matrixSize);

    let matrixArray = [];

    //let matrixArray = createMatrixArray(matrixSize);

    matrixArray = cellColorChange(matrixSize, maze, sizeSquare, matrixContainer, state, flag);

    console.log(matrixArray);

    const startEvent = (event) => {
        if (!flag.startPointClicked) {
            let cellDiv = event.target;
            if (state.currentGreenCell === null && flag.countClickGreen) {
                startPoint(matrixSize, matrixContainer, state, flag, matrixArray, start);
            } else {
                cellDiv.style.backgroundColor = colors.whiteColor;
                state.currentGreenCell = null;
                flag.countClickGreen = true;
                const rowIndex = Math.floor(index / matrixSize);
                const colIndex = index % matrixSize;
                maze[rowIndex][colIndex] = 0;
            }
        }
        //flag.startPointClicked = true;
        document.getElementById("startPoint").removeEventListener("click", startEvent);
    }

    const endEvent = (event) => {
        if (!flag.endPointClicked) {
            let cellDiv = event.target;
            if (state.currentRedCell === null && flag.countClickRed) {
                endPoint(matrixSize, matrixContainer, state, flag, matrixArray, end);
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
        //flag.endPointClicked = true;
    }

    const findEvent = () => {
        let way = [];
        if (!flag.countClickRed && !flag.countClickGreen) {
            console.log('Start:', start);
            console.log('End:', end);
    
            console.log(matrixArray);
        
            console.log(start, end);
            way = findWayAlgorithm(matrixSize, matrixArray, matrixContainer, start, end);
    
            console.log("way", way);
        
            for (let i = 1; i < way.length - 1; i++) {
                finalyChangeColor(matrixSize, matrixContainer, way[i].x, way[i].y);
            }
        }
        document.getElementById("findWay").removeEventListener("click", findWay);
    }

    document.getElementById("startPoint").addEventListener("click", startEvent);

    document.getElementById("endPoint").addEventListener("click", endEvent);

    document.getElementById("findWay").addEventListener("click", findEvent);
}

document.getElementById("create").addEventListener("click", createMaze);



