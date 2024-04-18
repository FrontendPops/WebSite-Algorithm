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
        const [childPathFirst, childPathSecond] = crossover(parentFirst.path, parentSecond.path);

        // Применяем мутацию для обоих потомков 
        mutate(childPathFirst, mutationRate, points);
        mutate(childPathSecond, mutationRate, points);

        // Убедимся, что в каждом потомке содержатся все вершины 
        const completeChildPathFirst = makeCompletePath(childPathFirst, points.length);
        const completeChildPathSecond = makeCompletePath(childPathSecond, points.length);

        // Обновляем приспособленность для потомков на основе длины их путей 
        const childFitnessFirst = calculateFitness(completeChildPathFirst, points); // Обратная длина пути 
        const childFitnessSecond = calculateFitness(completeChildPathSecond, points); // Обратная длина пути 

        newPopulation.push({ path: completeChildPathFirst, fitness: childFitnessFirst });
        newPopulation.push({ path: completeChildPathSecond, fitness: childFitnessSecond });
    }

    return newPopulation;
}

function makeCompletePath(path, points) {
    const missPoints = Array.from({ length: points }, (_, index) => index).filter(point => !path.includes(point));
    const completePath = [...path];
    for (const point of missPoints) {
        completePath.push(point);
    }
    return completePath;
}

function crossover(parentFirst, parentSecond) {
    const crossoverPoint1 = Math.floor(Math.random() * parentFirst.length);
    const crossoverPoint2 = Math.floor(Math.random() * parentFirst.length);
    
    // Смотрим, что crossoverPoint1 меньше crossoverPoint2
    const start = Math.min(crossoverPoint1, crossoverPoint2);
    const end = Math.max(crossoverPoint1, crossoverPoint2);
    
    // Копируем сегмент родительского пути в потомков
    const child1 = parentFirst.slice(start, end + 1);
    const child2 = parentSecond.slice(start, end + 1);
    
    for (let i = 0; i < parentFirst.length; i++) {
        if (!child1.includes(parentSecond[(end + 1 + i) % parentFirst.length])) {
            child1.push(parentSecond[(end + 1 + i) % parentFirst.length]);
        }
        
        if (!child2.includes(parentFirst[(end + 1 + i) % parentFirst.length])) {
            child2.push(parentFirst[(end + 1 + i) % parentFirst.length]);
        }
    }
    
    return [child1, child2];
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

export function findBestPath(points, populationSize, mutationRate, generations) {
    let population = createPopulation(populationSize, points.length);
    let uniquePaths = new Set(); // Используем Set для хранения уникальных путей 
    let fittestIndividual = 0;

    for (let generation = 0; generation < generations; generation++) {
        population = evolvePopulation(population, 15, mutationRate, points);
        fittestIndividual = getFittestIndividual(population, points);

        // Добавляем только уникальные пути в массив 
        uniquePaths.add(JSON.stringify(fittestIndividual.path));
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