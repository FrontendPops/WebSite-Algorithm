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
    const newPopulation = [];
    population.sort((a, b) => calculatePathDistance(a.path, points) - calculatePathDistance(b.path, points)); // Сортируем по возрастанию длины пути

    for (let i = 0; i < population.length; i += 2) {
        const parentFirst = population[i];
        const parentSecond = population[i + 1]; // Берем пары родителей последовательно


        const crossoverPoint = Math.floor(Math.random() * parentFirst.length); 

        // Выполняем кроссовер
        const [childPathFirst, childPathSecond] = crossover(parentFirst.path, parentSecond.path, crossoverPoint);

        // Используем мутацию для обоих потомков
        mutate(childPathFirst, mutationRate);
        mutate(childPathSecond, mutationRate);

        // Обновляем приспособленность для потомков на основе длины их путей
        const childFitnessFirst = calculatePathDistance(childPathFirst, points);
        const childFitnessSecond = calculatePathDistance(childPathSecond, points);
        newPopulation.push({ path: childPathFirst, fitness: childFitnessFirst });
        newPopulation.push({ path: childPathSecond, fitness: childFitnessSecond });
    }

    return newPopulation;
}

function crossover(parentFirst, parentSecond, crossoverPoint) {
        const childFirst = [...parentFirst.slice(0, crossoverPoint), ...parentSecond.slice(crossoverPoint)];
        const childSecond = [...parentSecond.slice(0, crossoverPoint), ...parentFirst.slice(crossoverPoint)];
    
        // Удаление повторяющихся генов из потомков
        const newChildFirst = Array.from(new Set(childFirst));
        const newChildSecond = Array.from(new Set(childSecond));
    
        return [newChildFirst, newChildSecond];
    
}


function mutate(path, mutationRate) {
    for (let i = 0; i < path.length; i++) {
        if (Math.random() < mutationRate) {
            const j = Math.floor(Math.random() * path.length);
            [path[i], path[j]] = [path[j], path[i]]; // меняем местами вершины
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

    // Реализация 2-opt алгоритма для оптимизации и для более вероятной точности
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
    distance += Math.sqrt((points[path[path.length - 1]].x - points[path[0]].x) ** 2 + (points[path[path.length - 1]].y - points[path[0]].y) ** 2);
    return distance;
}

// Перемешка для случайного порядка - алгоритм (Fisher–Yates shuffle)
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
