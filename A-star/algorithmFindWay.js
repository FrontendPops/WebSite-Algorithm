import { cellColorChange, start, end } from "./app.js";

export const findWayAlgorithm = (matrixArray, matrixSize, maze, sizeSquare, matrixContainer, state, flag) => {
    const startNode = new NodeCell(null, start.x, start.y);
    const endNode = new NodeCell(null, end.x, end.y);

    startNode.F = 0;
    startNode.G = 0;
    startNode.H = 0;
    endNode.F = 0;
    endNode.G = 0;
    endNode.H = 0;

    const possibleCell = [];
    const passedCell = [];

    possibleCell.push(startNode);

    while (possibleCell.length > 0) {
        let currentNode = possibleCell[0];
        let currentIndex = 0;

        for (let index = 0; index < possibleCell.length; index++) {
            const item = possibleCell[index];

            if (item.F < currentNode.F) {
                currentNode = item;
                currentIndex = index;
            }
        }

        //cellColorChange(matrixSize, maze, sizeSquare, matrixArray, matrixContainer, state,
         //   flag, currentNode.position.x, currentNode.position.y, -1);

        possibleCell.pop(currentIndex);
        passedCell.push(currentNode);

        if (currentNode.position.x === endNode.position.x && currentNode.position.y === endNode.position.y) {
            const way = [];
            let current = currentNode;
            while (current !== null) {
                way.push(current.position);
                current = current.parent;
            }
            console.log(123)
            way.reverse();
            return way
        }
        const children = [];

        const newPositions = [
            [0, -1],
            [-1, 0],
            [-1, -1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
            [-1, 1]
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
            if (matrixArray[nodePosition.x][nodePosition.y] !== 0) {
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

            for (let possibleCellNode of possibleCell) {
                if (child.isEqual(possibleCellNode) && child.G > possibleCellNode.G) {
                    skipChild = true;
                    break;
                }
            }
            if (!skipChild) {
                possibleCell.push(child);
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
    return ((firstElement.position.x - secondElement.position.x) ** 2 +
        (firstElement.position.y - secondElement.position.y) ** 2);
};

