
export function createPopulation(populationSize, vertex) {
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        const path = Array.from({ length: vertex }, (_, index) => index);
        shuffleArray(path); // произвольно делаем начальный путь
        population.push({ path, fitness: 0 }); // path - путь, fitness: 0 выставляем изначально для каждого уровень приспособленности
    }
    return population;
}

export function evolvePopulation(population, mutationRate, points) {
    console.log("Mutation rate:", mutationRate);
    const newPopulation = [];
    population.sort((a, b) => calculatePathDistance(a.path, points) - calculatePathDistance(b.path, points)); // Сортируем по возрастанию длины пути

    for (let i = 0; i < population.length; i++) {
        const parentA = population[i];
        const parentB = i % 2 === 0 ? population[i + 1] : population[i - 1]; // Выполняем турнирный отбор

        // Используем дистанцию кроссовера
        const crossoverPoint = Math.floor(Math.random() * parentA.path.length);
        const childPath = crossover(parentA.path, parentB.path, crossoverPoint);

        // Используем мутацию с вершиной кроссовера
        mutate(childPath, mutationRate, crossoverPoint);

        // Обновляем приспособленность для потомка на основе длины его пути
        const childFitness = calculatePathDistance(childPath, points);
        newPopulation.push({ path: childPath, fitness: childFitness });
    }

    return newPopulation;
}

function crossover(parentA, parentB, crossoverPoint) {
    const parentASlice = parentA.slice(0, crossoverPoint);
    const parentBSlice = parentB.slice(crossoverPoint);

    const childPath = [...parentASlice, ...parentBSlice];
    return childPath;
}

// Мутация
function mutate(path, mutationRate, crossoverPoint) {
    for (let i = 0; i < path.length; i++) {
        if (Math.random() < mutationRate) {
            const j = Math.floor(Math.random() * path.length);
            const dist = Math.sqrt((path[i].x - path[j].x) ** 2 + (path[i].y - path[j].y) ** 2);
            if (dist > crossoverPoint) {
                [path[i], path[j]] = [path[j], path[i]]; // меняем местами вершины
            }
        }
    }
}

export function getFittestIndividual(population, points) {
    return population.reduce((prev, current) => calculatePathDistance(prev.path, points) < calculatePathDistance(current.path, points) ? prev : current);
}

function twoOptSwap(path, i, k) {
    const newPath = path.slice(0, i);
    newPath.push(...path.slice(i, k + 1).reverse());
    newPath.push(...path.slice(k + 1));
    return newPath;
}

export function findBestPath(points) {
    const n = points.length;
    const visited = new Array(n).fill(false);
    let result = [];

    // Делаем страт от первой вершины
    result.push(0);
    visited[0] = true;

    for (let i = 1; i < n; i++) {
        let minDist = Infinity;
        let next = -1;

        for (let j = 0; j < n; j++) {
            if (!visited[j]) {
                const dist = Math.sqrt((points[result[i - 1]].x - points[j].x) ** 2 + (points[result[i - 1]].y - points[j].y) ** 2);

                if (dist < minDist) {
                    minDist = dist;
                    next = j;
                }
            }
        }

        result.push(next);
        visited[next] = true;
    }

    // Реализация 2-opt алгоритма
    let improved = true;
    while (improved) {
        improved = false;
        for (let i = 0; i < result.length - 1; i++) {
            for (let k = i + 1; k < result.length; k++) {
                const newPath = twoOptSwap(result, i, k);
                const newDistance = calculatePathDistance(newPath, points);
                if (newDistance < calculatePathDistance(result, points)) {
                    result = newPath;
                    improved = true;
                }
            }
        }
    }

    return result;
}

// Рассчитывание длину пути от одной вершины до другой
function calculatePathDistance(path, points) {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        distance += Math.sqrt((points[path[i]].x - points[path[i + 1]].x) ** 2 + (points[path[i]].y - points[path[i + 1]].y) ** 2);
    }
    distance += Math.sqrt((points[path[path.length - 1]].x - points[path[0]].x) ** 2 + (points[path[path.length - 1]].y - points[path[0]].y) ** 2); // Return to the starting point
    return distance;
}

// Перемешка для случайного порядка - алгоритм (Fisher–Yates shuffle)
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
