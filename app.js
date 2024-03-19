

document.getElementById("matrixSize").addEventListener("input", function displayField() {
    const matrixSize = parseInt(document.getElementById("matrixSize").value);
    const containerWidth = 500;
    const containerHeight = 500;
    const sizeSquare = containerWidth / matrixSize;

    const matrixContainer = document.getElementById('container');
    matrixContainer.innerHTML = '';

    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.style.width = sizeSquare + 'px';
            cellDiv.style.height = sizeSquare + 'px';
            cellDiv.style.backgroundColor = '#FFFFFF';
            cellDiv.style.margin = '0';
            cellDiv.style.position = 'absolute';

            const leftPos = sizeSquare * j;
            const topPos = sizeSquare * i;

            cellDiv.style.left = leftPos + 'px';
            cellDiv.style.top = topPos + 'px';
            
            cellDiv.addEventListener('click', function() {
                if (cellDiv.style.backgroundColor === 'rgb(128, 128, 128)') {
                    cellDiv.style.backgroundColor = '#FFFFFF';
                } else {
                    cellDiv.style.backgroundColor = '#808080';
                }
            });

            matrixContainer.appendChild(cellDiv);
        }
    }
    matrixContainer.style.width = containerWidth + 'px';
    matrixContainer.style.height = containerHeight + 'px';

    
});
