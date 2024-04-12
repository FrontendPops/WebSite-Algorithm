
export function createPopulation(populationSize, vertex) {
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        const path = Array.from({ length: vertex }, (_, index) => index);
        shuffleArray(path); // произвольно делаем начальный путь 
        population.push({ path, fitness: 0 }); // path - путь, fitness: 0 выставляем изначально для каждого уровень приспособленности 
    }
    return population;
}

export function evolvePopulation(population, tournamentSize, mutationRate, points) {
    const newPopulation = [];
    
    while (newPopulation.length < population.length) {
        // Выбираем случайные индивидов для участия в турнире
        const tournamentParticipants = [];
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournamentParticipants.push(population[randomIndex]);
        }
        
        // Находим победителя турнира (индивида с наивысшей приспособленностью)
        tournamentParticipants.sort((a, b) => b.fitness - a.fitness);
        const parentFirst = tournamentParticipants[0];
        
        // Выбираем второго родителя таким же образом
        let parentSecond;
        do {
            const randomIndex = Math.floor(Math.random() * population.length);
            parentSecond = population[randomIndex];
        } while (parentSecond === parentFirst);
        
        // Выполняем кроссовер
        const crossoverPoint = Math.floor(Math.random() * parentFirst.path.length);
        const [childPathFirst, childPathSecond] = crossover(parentFirst.path, parentSecond.path, crossoverPoint);
        
        // Применяем мутацию для обоих потомков
        mutate(childPathFirst, mutationRate);
        mutate(childPathSecond, mutationRate);
        
        // Убедимся, что в каждом потомке содержатся все вершины
        const completeChildPathFirst = makeCompletePath(childPathFirst, points.length);
        const completeChildPathSecond = makeCompletePath(childPathSecond, points.length);
        
        // Применяем оптимизацию 2-opt
        // const optimizedPathFirst = twoOpt(completeChildPathFirst, points);
        // const optimizedPathSecond = twoOpt(completeChildPathSecond, points);
        
        // Обновляем приспособленность для потомков на основе длины их путей
        const childFitnessFirst = 1 / calculateFitness(completeChildPathFirst, points); // Обратная длина пути
        const childFitnessSecond = 1 / calculateFitness(completeChildPathSecond, points); // Обратная длина пути
        
        newPopulation.push({ path: completeChildPathFirst, fitness: childFitnessFirst });
        newPopulation.push({ path: completeChildPathSecond, fitness: childFitnessSecond });
    }
    
    return newPopulation;
}

function makeCompletePath(path, vertexCount) {
    const missingVertices = Array.from({ length: vertexCount }, (_, index) => index).filter(vertex => !path.includes(vertex));
    const completePath = [...path];
    for (const vertex of missingVertices) {
        completePath.push(vertex);
    }
    return completePath;
}

function crossover(parentFirst, parentSecond, crossoverPoint) {
    const childFirst = [];
    const childSecond = [];

    // Копируем часть родителей до точки перекрещивания
    childFirst.push(...parentFirst.slice(0, crossoverPoint));
    childSecond.push(...parentSecond.slice(0, crossoverPoint));

    // Заполняем оставшуюся часть потомков оставшимися вершинами из других родителей
    let indexFirst = crossoverPoint;
    let indexSecond = crossoverPoint;

    for (let i = 0; i < parentFirst.length; i++) {
        if (!childFirst.includes(parentSecond[i])) {
            childFirst.push(parentSecond[i]);
        }

        if (!childSecond.includes(parentFirst[i])) {
            childSecond.push(parentFirst[i]);
        }

        // Переходим к следующей вершине в родителях
        indexFirst = (indexFirst + 1) % parentFirst.length;
        indexSecond = (indexSecond + 1) % parentFirst.length;
    }

    return [childFirst, childSecond];
}


export function mutate(path, mutationRate) {
    const mutationThreshold = Math.floor(path.length * mutationRate);
    for (let i = 0; i < mutationThreshold; i++) {
        const startIndex = Math.floor(Math.random() * path.length);
        const endIndex = Math.floor(Math.random() * path.length);
        const subPathLength = Math.min(endIndex - startIndex + 1, path.length - endIndex + startIndex + 1);
        const subPath = path.slice(startIndex, startIndex + subPathLength);
        const insertIndex = Math.floor(Math.random() * (path.length - subPathLength + 1));
        path = path.slice(0, insertIndex).concat(subPath).concat(path.slice(insertIndex + subPathLength));
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

// export function findBestPath(points, populationSize, mutationRate, generations) {
//     let population = createPopulation(populationSize, points.length);
//     let allPaths = [];
//     let fittestIndividual = 0;
//     for (let generation = 0; generation < generations; generation++) {
//         population = evolvePopulation(population, mutationRate, points);
//         fittestIndividual = getFittestIndividual(population, points);
//         allPaths.push(fittestIndividual.path)
//         allPaths.push(twoOpt(fittestIndividual.path, points));
//     }
//     return allPaths;
// }

export function findBestPath(points, populationSize, mutationRate, generations) {
    let population = createPopulation(populationSize, points.length);
    let uniquePaths = new Set(); // Используем Set для хранения уникальных путей
    let fittestIndividual = 0;

    for (let generation = 0; generation < generations; generation++) {
        population = evolvePopulation(population, 5, mutationRate, points);
        fittestIndividual = getFittestIndividual(population, points);

        // Добавляем только уникальные пути в массив
        uniquePaths.add(JSON.stringify(fittestIndividual.path));
        uniquePaths.add(JSON.stringify(twoOpt(fittestIndividual.path, points)));
    }

    // Преобразуем уникальные пути из Set обратно в массив и возвращаем
    return Array.from(uniquePaths).map(path => JSON.parse(path));
}

// Рассчитывание длину пути от одной вершины до другой 
export function calculatePathDistance(path, points) {
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

export function calculateFitness(path, points) {
    const distance = calculatePathDistance(path, points);
    return 1 / distance; // Обратная длина пути, чем меньше длина, тем выше приспособленность
}

function twoOpt(path, points) {
    let improved = true;
    while (improved) {
        improved = false;
        for (let i = 0; i < path.length - 2; i++) {
            for (let k = i + 2; k < path.length; k++) {
                const newPath = twoOptSwap(path, i, k);
                const newPathFitness = calculateFitness(newPath, points);
                const currentPathFitness = calculateFitness(path, points);
                if (newPathFitness > currentPathFitness) { // Оцениваем приспособленность
                    path = newPath;
                    improved = true;
                }
            }
        }
    }
    return path;
}