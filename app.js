const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let pointList = [];

canvas.addEventListener('mousedown', (event) => {
	const rect = canvas.getBoundingClientRect();
	const xVal = event.clientX - rect.left;
	const yVal = event.clientY - rect.top;

	pointList.push({ x: xVal, y: yVal });
  console.log(event.clientX, event.clientY);
	drawPoints();
});

function drawPoints() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	
	for (let point of pointList) {
    ctx.fillStyle = '#0';
		ctx.fillRect(point.x, point.y, 10, 10);
	}
}

function distance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function compareCentroids(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
  
function initializeClusters(pointList, k) {
    let clusters = [];
    let centroids = [];

    for (let i = 0; i < k; i++) {
      while (true) {
        let checked = true;
        centroidCandidate = pointList[getRandomInt(pointList.length)];
        for (let j = 0; j < centroids.length; j++) {
          if (centroidCandidate.x == centroids[j].x ||centroidCandidate.xy == centroids[j].y) checked = false;
        }
        if (checked) break;
      }
      centroids.push(centroidCandidate);
    }
    for (let i = 0; i < k; i++) {

      let newCluster = {
        index: i,
        points: [
          {x: centroids[i].x,
          y: centroids[i].y}
        ],
        centroid: {
          x: centroids[i].x,
          y: centroids[i].y
        }
      };
      console.log("CENTROID " + newCluster.centroid.x + " " + newCluster.centroid.y);
      clusters.push(newCluster);
    }

    for (let i = 0; i < pointList.length; i++) {
        let minDistance = Infinity;
        let clusterIndex = -1;
        for (let j = 0; j < k; j++) {
            let distanceToCluster = distance(pointList[i], clusters[j].centroid);
            if (distanceToCluster < minDistance) {
                minDistance = distanceToCluster;
                clusterIndex = j;
            }
        }
        clusters[clusterIndex].points.push(pointList[i]);
    }
    return clusters;
}
  
function updateClusters(clusters, pointList) {

  const newClusters = clusters.map(cluster => ({
    index: cluster.index,
    points: [],
    centroid:  {
      x: cluster.points.reduce((acc, point) => acc + point.x, 0) / cluster.points.length,
      y: cluster.points.reduce((acc, point) => acc + point.y, 0) / cluster.points.length
    }
  }));
  

  for (let point of pointList) {
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
  
let input = document.querySelector('input');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
  console.log("Starting..."); 
  let k = input.value;
  if (pointList.length >= k) {
    let clusters = initializeClusters(pointList, k);
    let iteration = 0;
    let isConverged = false;
  
    while (iteration < 50) {
      clusters = updateClusters(clusters, pointList);
      iteration++;
    }
    drawClusters(clusters);
  }
  
});
  
