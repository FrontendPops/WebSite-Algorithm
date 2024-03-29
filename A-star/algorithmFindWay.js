import { start, end } from "./app.js";
import { colors } from "./constants.js"

export const findWayAlgorithm = (matrixSize, matrixArray, matrixContainer) => {
    const startNode = new NodeCell(null, start.x, start.y);
    const endNode = new NodeCell(null, end.x, end.y);

    startNode.F = 0;
    startNode.G = 0;
    startNode.H = 0;
    endNode.F = 0;
    endNode.G = 0;
    endNode.H = 0;

    const possibleCell = [startNode];
    const passedCell = [];

    while (possibleCell.length > 0) {
        let currentNode = possibleCell[0];
        let currentIndex = 0;

        // Убедимся, что addedNeighbors корректно отражает соседние узлы, добавленные в possibleCell
        const addedNeighbors = possibleCell.map(cell => cell !== currentNode);

        if (currentNode.position.x === endNode.position.x && currentNode.position.y === endNode.position.y) {
            const way = [];
            let current = currentNode;
            while (current !== null) {
                way.push(current.position);
                current = current.parent;
            }
            way.reverse();
            return way;
        }

        updateColorCell(matrixSize, matrixContainer, matrixArray, currentNode.position.x, currentNode.position.y);

        if (addedNeighbors.every(neighbor => neighbor)) {
            possibleCell.splice(currentIndex, 1);
            passedCell.push(currentNode);
            continue; // Переходим к следующей итерации цикла
        }

        possibleCell.splice(currentIndex, 1);
        passedCell.push(currentNode);

        const children = [];
        const newPositions = [
            [0, -1],
            [-1, 0],
            [0, 1],
            [1, 0]
        ];

        for (let newPosition of newPositions) {
            const nodePosition = {
                x: currentNode.position.x + newPosition[0],
                y: currentNode.position.y + newPosition[1]
            };
            if (nodePosition.x > matrixArray.length - 1 || nodePosition.x < 0 ||
                nodePosition.y > matrixArray[0].length - 1 || nodePosition.y < 0) {
                continue;
            }
            if (matrixArray[nodePosition.x][nodePosition.y] !== 0 && matrixArray[nodePosition.x][nodePosition.y] !== 3) {
                continue;
            }
            const newNode = new NodeCell(currentNode, nodePosition.x, nodePosition.y);
            children.push(newNode);
        }

        for (let child of children) {
            let skipChild = false;
            for (let currentChild of passedCell) {
                if (child.isEqual(currentChild)) {
                    skipChild = true;
                    break;
                }
            }
            if (skipChild) continue;
        
            child.G = currentNode.G + 1;
            child.H = heuristic(child, endNode);
            child.F = child.G + child.H;
        
            let found = false;
            for (let i = 0; i < possibleCell.length; i++) {
                const possibleCellNode = possibleCell[i];
                if (child.isEqual(possibleCellNode)) {
                    found = true;
                    if (child.G < possibleCellNode.G) {
                        possibleCellNode.G = child.G;
                        possibleCellNode.F = child.F;
                        possibleCellNode.parent = child.parent;
                    }
                    break;
                }
            }
        
            if (!found) {
                possibleCell.push(child);
            } else {
                const index = possibleCell.findIndex(node => node.isEqual(child));
                if (child.G < possibleCell[index].G) {
                    possibleCell[index].G = child.G;
                    possibleCell[index].F = child.F;
                    possibleCell[index].parent = child.parent;
                }
            }
        }
    }
};

class NodeCell {
    constructor(parents = null, x = null, y = null) {
        this.parent = parents;
        this.position = { x, y };
        this.G = 0;
        this.H = 0;
        this.F = 0;
    }

    isEqual(other) {
        return this.position.x === other.position.x && this.position.y === other.position.y;
    }
}

const heuristic = (firstElement, secondElement) => {
    return Math.abs(firstElement.position.x - secondElement.position.x) +
           Math.abs(firstElement.position.y - secondElement.position.y);
};

const updateColorCell = (matrixSize, matrixContainer, matrixArray, x, y) => {
    if (matrixArray[x][y] !== 2 && matrixArray[x][y] !== 3) {
        const cellDivs = matrixContainer.querySelectorAll('.cell');
        for (let i = 0; i < cellDivs.length; i++) {
            const cellDiv = cellDivs[i];
            const cellX = i % matrixSize;
            const cellY = Math.floor(i / matrixSize);

            if (cellX === y && cellY === x) {
                cellDiv.style.backgroundColor = colors.lemonColor;
                return;
            }
        }
    }

}