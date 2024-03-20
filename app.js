const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let points = [];

canvas.addEventListener('mousedown', (event) => {
	const rect = canvas.getBoundingClientRect();
	const xVal = event.clientX - rect.left;
	const yVal = event.clientY - rect.top;

	points.push({ x: xVal, y: yVal });
  console.log(event.clientX, event.clientY);
	drawPoints();
});

function drawPoints() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#0';
	for (let point of points) {
		ctx.fillRect(point.x, point.y, 10, 10);
	}
}

function distance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  }
  
function initializeClusters(points, k) {
    let clusters = [];
    for (let i = 0; i < k; i++) {
        clusters.push({
        index: i,
        points: [points[i]],
        centroid: { x: points[i].x, y: points[i].y }
        });
    }
    for (let i = k; i < points.length; i++) {
        let minDistance = Infinity;
        let clusterIndex = -1;
        for (let j = 0; j < k; j++) {
            let distanceToCluster = distance(points[i], clusters[j].centroid);
            if (distanceToCluster < minDistance) {
                minDistance = distanceToCluster;
                clusterIndex = j;
            }
        }
        clusters[clusterIndex].points.push(points[i]);
    }
    console.log(clusters);
    return clusters;
}
  
  function updateClusters(clusters, points) {
    const newClusters = clusters.map(cluster => {
      const sumX = cluster.points.reduce((acc, point) => acc + point.x, 0);
      const sumY = cluster.points.reduce((acc, point) => acc + point.y, 0);
      const centroid = {
        x: sumX / cluster.points.length,
        y: sumY / cluster.points.length
      };
      return { ...cluster, centroid };
    });
    
;

    for (let point of points) {
      let minDistance = Infinity;
      let closestClusterIndex = -1;

      for (let m = 0; m < newClusters.length; m++) {
        const distanceToCluster = distance(point, newClusters[m].centroid);

        if (distanceToCluster < minDistance) {
          minDistance = distanceToCluster;
          closestClusterIndex = m;
        }
      }
        
        newClusters[closestClusterIndex].points.push(point);
      }
    
    console.log(newClusters);
    return newClusters;
  }
  
  function drawClusters(clusters) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let cluster of clusters) {
      ctx.fillStyle = `hsl(${cluster.index * 360 / clusters.length}, 100%, 50%)`;
      for (let point of cluster.points) {
        ctx.fillRect(point.x, point.y, 10, 10);
      }
    }
  }
  
  const k = 5;
  
  const startButton = document.getElementById('start-button');
  startButton.addEventListener('click', () => {
    console.log("Starting...");
    let clusters = initializeClusters(points, k);
    let iteration = 0;
    let isConverged = false;

    while (iteration < 100) {
      console.log(iteration);
      clusters = updateClusters(clusters, points);
      iteration++;
    }
    drawClusters(clusters);
  });
  
