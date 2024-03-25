export function createWalls(matrixSize) {
    const width = matrixSize * 2 + 1;
    const height = matrixSize * 2 + 1;
    const maze = [];

    for (let i = 0; i < width; i++) {
        maze[i] = [];
        for (let j = 0; j < height; j++) {
            maze[i][j] = 1;
        }
    }

    let x = Math.floor(Math.random() * Math.floor(width / 2)) * 2 + 1;
    let y = Math.floor(Math.random() * Math.floor(height / 2)) * 2 + 1;
    maze[x][y] = 0;
    const stack = [{ x, y }];

    while (stack.length > 0) {
        const current = stack.pop();
        x = current.x;
        y = current.y;

        const directions = shuffleDirections();
        for (let dir of directions) {
            const [dx, dy] = dir;
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx > 0 && nx < width && ny > 0 && ny < height && maze[nx][ny] === 1) {
                maze[nx][ny] = 0;
                maze[(x + nx) / 2][(y + ny) / 2] = 0;
                stack.push({ x: nx, y: ny });
            }
        }
    }

    return maze;
}

function shuffleDirections() {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    return directions;
}