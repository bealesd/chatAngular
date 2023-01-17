function lineChart(){
    
    let scatterChartData = [{ year: 2022, age: 30 }, { year: 2022, age: 30 }, { year: 2021, age: 29 }, { year: 2020, age: 29 }, { year: 2022, age: 30 }];
    scatterChartData = [{
        x: 10,
        y: 20
    }, {
        x: 15,
        y: 10
    }];
    
    
    const canvas = document.getElementById("scatter-chart");
    const ctx = canvas.getContext("2d");
    
    var chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["2020", "2021", new Date('2022-12-05T00:00:00')],
            datasets: [
                {
                    label: "Age",
                    data: [10.0, 10.8, 9.8],
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    fill: false,
                    borderWidth: 1
                },
                {
                    label: "Age2",
                    fill: false,
                    data: [11.0, 10.8, 8.8],
                    backgroundColor: "rgba(255, 99, 172, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

