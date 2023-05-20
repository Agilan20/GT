//Graph must be 1 based 
// meaning first node should be 1 not 0 
function chromaticNumber(N, E, U, V) {
    //creating an adjacency list 
    let adj = new Array(N)
    let colors = new Array(N)
    for (let i = 0; i < N; i++) {
        adj[i] = []
        colors[i] = -1;
    }

    for (let i = 0; i < E; i++) {
        adj[U[i] - 1].push(V[i] - 1);
        adj[V[i] - 1].push(U[i] - 1);
    }
    //traversing each nodes one by one and assigning 
    //the smallest color possible
    for (let i = 0; i < N; i++) {
        //tempcolor array 
        let clr = new Array(N);
        for (let j = 0; j < clr.length; j++) clr[j] = 0;
        for (let j = 0; j < adj.length; j++) {
            if (colors[adj[i][j]] > -1) clr[colors[adj[i][j]]] = 1
        }
        //let st = clr.join(',')
        //console.log(i,":",st) 
        let finalColor = 0;
        for (let j = 0; j < clr.length; j++) {
            if (clr[j] == 0) {
                finalColor = j; break;
            }
        }

        colors[i] = finalColor;
    }


    let maxColor = 1;
    for (let i = 0; i < N; i++) {
        if (colors[i] > maxColor) maxColor = colors[i];
    }

    let s = colors.join(',')
    console.log("color array:", s)
    console.log("Minimum color needed to color the graph :", maxColor + 1)
    return {
        colorArray: colors,
        maxColor: maxColor+1
    }
}

module.exports = chromaticNumber;


// //Sample testcase 1
// // let N = 5, E = 6; // N is number of vertices ,
// // //E is no of edges
// // let U = [ 1, 2, 3, 1, 2, 3 ];
// // let V = [ 3, 3, 4, 4, 5, 5 ];

// // there is an edge from U[i] to V[i]

// let N = 6, E = 9;
// let U = [1, 1, 1, 2, 2, 3, 3, 4, 5]
// let V = [2, 3, 4, 4, 6, 4, 6, 5, 6]
// chromaticNumber(N, E, U, V)