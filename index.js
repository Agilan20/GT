const express = require("express")
const path = require("path")
const app = express()
const port = 8000;
const fs = require("fs");
const dataFile = require("./data.json");
const staticPath = path.join(__dirname, "./public")
app.use(express.json());
app.use(express.urlencoded())
app.set('view engine', 'ejs')
app.use(express.static("public"));
const chromaticNumber = require("./chrom")
const nodeData = require("./node.json")
const colorData = require("./color.json")
const cyscape = require("./cyto.json")
//functions for finding the edge connectivity
function max(a, b) {
    if (a == b)
        return a;
    else {
        if (a > b)
            return a;
        else
            return b;
    }
}


function findAdjacency(arr, dep, n) {

    var i = 1, j = 0;

    //Let U be the source nodes 
    let U = [];
    //Let V be the target nodes 
    let V = [];

    // run a nested loop to find overlap
    for (var i = 0; i < n; i++) {

        for (var j = 0; j < n; j++) {
            // check for overlap
            if (i != j)
                if (arr[i] >= arr[j] && arr[i] < dep[j]) {
                    U.push(i + 1);
                    V.push(j + 1)
                }

        }


    }
    
    return {
        source: U,
        target: V
    };
}

// var arr = [100, 300, 500]
// var dep = [900, 400, 600]
// var n = 3;

// template engine route
app.get("/", (req, res) => {

    const date = new Date();
    date.setDate(date.getDate() + 1);

    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();
    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

    res.render("index", {
        date: currentDate
    })
})



//redirect here on form submit
app.post("/form-submit", (req, res) => {

    const date = new Date();
    date.setDate(date.getDate() + 1);

    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();

    // we will display the date as DD-MM-YYYY 

    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

    let body = req.body

    //arrival time string convert
    let arrivalTime = ""
    for (let i = 0; i < body.arr.length; i++) {
        if (body.arr[i] == ':' || (i == 0 && body.arr[i] == '0')) {
            continue;
        } else {
            arrivalTime += body.arr[i]
        }
    }
    arrivalTime = Number(arrivalTime)

    //departure time string convert
    let depatureTime = ""
    for (let i = 0; i < body.dep.length; i++) {
        if (body.dep[i] == ':' || (i == 0 && body.dep[i] == '0')) {
            continue;
        } else {
            depatureTime += body.dep[i]
        }
    }
    depatureTime = Number(depatureTime)
    let data;

    try {
        const jsonString = fs.readFileSync('./data.json', 'utf-8')
        data = JSON.parse(jsonString)
    } catch (error) {
        console.log(error)
    }
    body = {
        id: data.length + 1,
        username: body.username,
        arr: arrivalTime,
        dep: depatureTime,
        date: currentDate
    }
    data.push(body)
    
    fs.writeFileSync('./data.json', JSON.stringify(data), err => {
        if (err) console.log(err)
        else {
            console.log("Written successfully")
        }
    })
    res.redirect("/visualize")


})

app.get("/visualize", (req, res) => {

    let data;

    try {
        const jsonString = fs.readFileSync('./data.json', 'utf-8')
        data = JSON.parse(jsonString)
    } catch (error) {
        console.log(error)
    }
    const date = new Date();
    date.setDate(date.getDate() + 1);

    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();

    // we will display the date as DD-MM-YYYY 

    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

    data = data.filter((x) => x.date === currentDate)

    console.log(data.length)

    //let N be the number of nodes
    let N = data.length;

    //let arrTime = [] be the list of arrival time
    let arrTime = []
    for (let i = 0; i < data.length; i++) {
        arrTime.push(data[i].arr)
    }

    //let depTime = [] be the list of depature time
    let depTime = []
    for (let i = 0; i < data.length; i++) {
        depTime.push(data[i].dep)
    }

    let result = findAdjacency(arrTime, depTime, N)
    let U = result.source;
    let V = result.target;

    // let E be the number of edges
    let E = U.length

    let chrom = chromaticNumber(N, E, U, V)
    let colorArray = chrom.colorArray;
    let maxColor = chrom.maxColor;

    //data to fetch to cytoscape

    //node Data
    let cy = []
    for (let i = 0; i < N; i++) {
        let tempNode = {
            group: 'nodes',
            id: nodeData[i].node,
            color: colorData[colorArray[i]].color,
            bg: colorData[colorArray[i]].bg,
            x: nodeData[i].position["x"],
            y: nodeData[i].position["y"]
        };
        cy.push(tempNode)
    }

    //edge data
    for (let i = 0; i < U.length; i++) {
        let tempEdge = {
            group: 'edges',
            id: 'e' + String(i + 1),
            source: 'n' + String(U[i]),
            target: 'n' + String(V[i]),
            label: i + 1
        }
        cy.push(tempEdge)
    }
    fs.writeFileSync('./cyto.json', JSON.stringify(cy), err => {
        if (err) console.log(err)
    })
    res.render("visualize", {
        response: cy,
        data: data
    })
})

app.listen(port, () => {
    console.log("Listening on port", port)
}) 