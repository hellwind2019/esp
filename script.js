

document.addEventListener("DOMContentLoaded", ready);
let serverUrl = `http://192.168.0.106:6969`;
//let serverUrl = `http://127.0.0.1:6969`
let ctxTemp;
let ctxHumi;
let ctxAir;

let temperatureChart;
let humidityChart;
let airChart;

let date_from;
let time_from;
let date_to;
let time_to;

async function ready() {
    ctxTemp = document.getElementById('temperatureChart').getContext('2d');
    ctxHumi = document.getElementById('humidityChart').getContext('2d');
    ctxAir = document.getElementById('airChart').getContext('2d');

    date_from = document.getElementById("date_from");
    time_from = document.getElementById("time_from");
    date_to = document.getElementById("date_to");
    time_to = document.getElementById("time_to");

    configureDateFilter();
    let button = document.getElementById("refresh");

    createCharts()

    update(temperatureChart, "Temperature")
    update(humidityChart, "Humidity")
    update(airChart, "Air")


    button.addEventListener("click", () => {
        update(temperatureChart, "Temperature")
        update(humidityChart, "Humidity")
        update(airChart, "Air")

    })

}
async function update(chart, endpoint, sensor_type) {
    const { labels, values } = await fetchData(endpoint, sensor_type);

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}


async function fetchData(sensor_type) {
    const df = date_from.value
    const tf = time_from.value
    const dt = date_to.value
    const tt = time_to.value
    //  if(df && tf && dt && tt)
    const from = `${df} ${tf}:00`;
    const to = `${dt} ${tt}:00`;

    const encodedFrom = encodeURIComponent(from);
    const encodedTo = encodeURIComponent(to);
    const url = `${serverUrl}/data?from=${encodedFrom}&to=${encodedTo}&type=${sensor_type}&avg=10`;
    console.log(url)


    const response = await fetch(url)
    const data = await response.json();


    const labels = data.map(entry => new Date(entry.record_time).toLocaleString());
    const values = data.map(entry => entry.sensor_value);

    return { labels, values };
}



function createCharts() {
    console.log("Fetching...")
    temperatureChart = CreateChart(ctxTemp, "Temperature");
    humidityChart = CreateChart(ctxHumi, "Humidity");
    airChart = CreateChart(ctxAir, "Air")
    console.log(typeof(airChart.data.datasets[0]));
    
    
    
}
function CreateChart(ctx, label1) {
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: label1,
                    data: [],
                    borderColor: 'rgb(102, 153, 255)',
                    backgroundColor: 'rgba(102, 153, 255, 0.3)',
                    fill: true,
                    tension: 0.1

                }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 50
            },
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
                        text: label1
                    },
                }
            }
        }

    })
    console.log("Create chart");
    
    console.log(chart.data.datasets[0]);
    
    return chart;
}

function loadDefaultDate() {
    const now = new Date();

    date_to.value = now.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
    time_to.value = now.toTimeString().split(' ')[0].substring(0, 5); // Get the time in HH:MM format

    now.setHours(now.getHours() - 1); // Subtract one hour

    date_from.value = now.toISOString().split('T')[0]; // Get the date in YYYY-MM-DD format
    time_from.value = now.toTimeString().split(' ')[0].substring(0, 5); // Get the time in HH:MM format
}
function configureDateFilter() {
    const savedDateFrom = localStorage.getItem("date_from");
    const savedTimeFrom = localStorage.getItem("time_from");
    const savedDateTo = localStorage.getItem("date_to");
    const savedTimeTo = localStorage.getItem("time_to");

    // If saved values exist, restore them
    if (savedDateFrom && savedTimeFrom) {
        date_from.value = savedDateFrom;
        time_from.value = savedTimeFrom;
    }

    if (savedDateTo && savedTimeTo) {
        date_to.value = savedDateTo;
        time_to.value = savedTimeTo;
    }

    // Set default values if no saved values exist
    if (!savedDateFrom || !savedTimeFrom) {
        const now = new Date();
        now.setHours(now.getHours() - 1); // Subtract one hour for "From" time

        date_from.value = now.toISOString().split('T')[0];
        time_from.value = now.toTimeString().split(' ')[0].substring(0, 5);
    }

    if (!savedDateTo || !savedTimeTo) {
        const now = new Date();
        date_to.value = now.toISOString().split('T')[0];
        time_to.value = now.toTimeString().split(' ')[0].substring(0, 5);
    }

    // Event listeners to save changes to localStorage when the user selects a new date or time
    date_from.addEventListener("change", saveValues);
    time_from.addEventListener("change", saveValues);
    date_to.addEventListener("change", saveValues);
    time_to.addEventListener("change", saveValues);
}
function saveValues() {
    localStorage.setItem("date_from", date_from.value);
    localStorage.setItem("time_from", time_from.value);
    localStorage.setItem("date_to", date_to.value);
    localStorage.setItem("time_to", time_to.value);
}

window.addEventListener('resize', () => {
    temperatureChart.resize(); // Resize the temperature chart
    humidityChart.resize();    // Resize the humidity chart
});

$(document).ready(function () {
    $('input[type = "checkbox"]').prop("checked", true);
    $('input[type = "checkbox"]').click(function () {
        var inputValue = $(this).attr('value');
        $("." + inputValue).toggle();
    })
})