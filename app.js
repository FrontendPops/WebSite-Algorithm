document.getElementById("matrixSize").addEventListener("input", function displayField() {
    const matrixSize = document.getElementById("matrixSize").value;
    const matrix = Array.from({ length: matrixSize }, () => Array.from({ length: matrixSize }, () => 0));
    
    const matrixContainer = document.getElementById('matrixContainer');
    matrixContainer.innerHTML = ''; // Clear previous content
    
    // Loop through the matrix and create cells
    for (let i = 0; i < matrix.length; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row clearfix'; // For clearfix
        
        for (let j = 0; j < matrix[i].length; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            
            if (matrix[i][j] === 0) {
                cellDiv.style.backgroundColor = '#fff'; // Set empty cell color
            } else {
                cellDiv.style.backgroundColor = '#000'; // Set filled cell color
            }
            
            rowDiv.appendChild(cellDiv);
        }
        
        matrixContainer.appendChild(rowDiv);
    }

});


