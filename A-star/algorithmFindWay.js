import { colors } from "./constants.js"

const updateColorCell = (matrixSize, matrixContainer, matrixArray, x, y) => {
    const lemonCells = matrixContainer.querySelectorAll('.cell[style="background-color: ' + colors.lemonColor + '"]');
    lemonCells.forEach(cell => cell.remove()); //Получаю все ячейки, которые имеют лимонный цвет и стираю

    if (matrixArray[x][y] !== 2 && matrixArray[x][y] !== 3) {
        if (matrixArray[x][y] === 1) {
            return; 
        }
        const cellDivs = matrixContainer.querySelectorAll('.cell');
        let delay = 5;
        for (let i = 0; i < cellDivs.length; i++) {
            const cellDiv = cellDivs[i];
            const cellX = i % matrixSize;
            const cellY = Math.floor(i / matrixSize);

            setTimeout(() => {
                if (cellX === y && cellY === x) {
                    cellDiv.style.backgroundColor = colors.lemonColor;
                }
            }, delay);
            delay += 5;
        }
    }
}

class NodeCell {
    constructor(parents = null, x = null, y = null) {
        this.parent = parents;
        this.position = { x, y };
        this.G = 0;
        this.H = 0;
        this.F = 0;
    }

    isEqual(other) {
        return this.position.x === other.position.x && this.position.y === other.position.y;//сравнение позиции текущего узла и другого узла
    }
}

const heuristic = (firstElement, secondElement) => {
    return Math.abs(firstElement.position.x - secondElement.position.x) +
           Math.abs(firstElement.position.y - secondElement.position.y); // использую манхэттенское расстояние
};

export const findWayAlgorithm = (matrixSize, matrixArray, matrixContainer, start, end) => {
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
    const way = [];

    while (possibleCell.length > 0) {
        let currentNode = possibleCell[0];
        let currentIndex = 0;

        const addedNeighbors = possibleCell.map(cell => cell !== currentNode); // смотрю на соседей точки проверяю что узел добавлен

        if (currentNode.position.x === endNode.position.x && currentNode.position.y === endNode.position.y) {//проверяю что дошел до конца
            let current = currentNode;
            while (current !== null) {
                way.push(current.position);//записываю путь
                current = current.parent;
            }
            way.reverse();
            return way;
        }

        updateColorCell(matrixSize, matrixContainer, matrixArray, currentNode.position.x, currentNode.position.y);// меняю цвет у текущей рассмотр клетки

        if (addedNeighbors.every(neighbor => neighbor)) {// все ли соседи добавлены
            possibleCell.splice(currentIndex, 1);// если все то удаляю текущий узел
            passedCell.push(currentNode);
            continue;
        }

        possibleCell.splice(currentIndex, 1);
        passedCell.push(currentNode);// добавляю рассмотренный узел в список посещенных

        const children = [];// храню дочерние узлы текущего узла

        const newPositions = [// новые позиции для дочерних узлов
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
                nodePosition.y > matrixArray[0].length - 1 || nodePosition.y < 0) {// проверка на границы
                continue;
            }
            if (matrixArray[nodePosition.x][nodePosition.y] !== 0 && matrixArray[nodePosition.x][nodePosition.y] !== 3) {
                continue;// смотрю можно ли пройти в новую позицию
            }
            const newNode = new NodeCell(currentNode, nodePosition.x, nodePosition.y);// создаю новый узел

            children.push(newNode);
        }

        for (let child of children) {// прохожу по всем дочерним узлам
            let skipChild = false;

            for (let currentChild of passedCell) {
                if (child.isEqual(currentChild)) {
                    skipChild = true;
                    break;// проверка что узел не был посещен
                }
            }
            if (skipChild) continue;
        
            child.G = currentNode.G + 1;
            child.H = heuristic(child, endNode);// считаем стоимость нового узла
            child.F = child.G + child.H;
        
            let found = false;

            for (let i = 0; i < possibleCell.length; i++) {
                const possibleCellNode = possibleCell[i];
                if (child.isEqual(possibleCellNode)) {// проверка на нахождение нового узла среди текущих рассматриваемых
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
                possibleCell.push(child);// если узла нет в списке возможных узлов добавляем его туда
            } else {
                const index = possibleCell.findIndex(node => node.isEqual(child));

                if (child.G < possibleCell[index].G) {
                    possibleCell[index].G = child.G;// записываем расстояние 
                    possibleCell[index].F = child.F;
                    possibleCell[index].parent = child.parent;
                }
            }
        }
    }
};