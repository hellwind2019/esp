
document.addEventListener("DOMContentLoaded", ready);
let serverUrl = `http://192.168.0.103:6969`;
let ctxTemp;
let ctxHumi;
let temperatureChart;
let humidityChart;

let date_from;
let time_from;
let date_to;
let time_to;
let endpoints = ["get-temperature-data", "get-humidity-data"]

function ready() {
    ctxTemp = document.getElementById('temperatureChart').getContext('2d');
    ctxHumi = document.getElementById('humidityChart').getContext('2d');

    date_from = document.getElementById("date_from");
    time_from = document.getElementById("time_from");
    date_to   = document.getElementById("date_to");
    time_to   = document.getElementById("time_to");

    let button = document.getElementById("refresh");

    createTemperatureChart()

    update(temperatureChart, endpoints[0])
    update(humidityChart, endpoints[1])

    button.addEventListener("click", () => {
        update(temperatureChart, endpoints[0])
        update(humidityChart, endpoints[1])
       
    })

}

async function fetchData(endpoint) {
    const df =  date_from.value
    const tf =  time_from.value
    const dt =  date_to.value
    const tt =  time_to.value
    if(df && tf && dt && tt){
        const from = `${df} ${tf}:00`; 
        const to = `${dt} ${tt}:00`;

        const encodedFrom = encodeURIComponent(from);
        const encodedTo = encodeURIComponent(to);
        const url = `${serverUrl}/data?from=${encodedFrom}&to=${encodedTo}`;
        console.log(url)
    }
   
    const response = await fetch(`${serverUrl}}/${endpoint}`);
    const data = await response.json();


    const labels = data.map(entry => new Date(entry.record_time).toLocaleString());
    const values = data.map(entry => entry.sensor_value);

    return { labels, values };
}



async function createTemperatureChart() {
    console.log("Fetching...")

    temperatureChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: false,
                        text: 'Time'
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    humidityChart = new Chart(ctxHumi, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity',
                data: [],
                borderColor: 'rgb(102, 153, 255)',
                backgroundColor: 'rgba(102, 153, 255, 0.3)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: false,
                        text: 'Time'
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Humidity'
                    }
                }
            }
        }
    });

}
async function update(chart, endpoint) {
    const { labels, values } = await fetchData(endpoint);

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

