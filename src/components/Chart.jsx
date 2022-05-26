/*global chrome*/
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Kattis Progress',
        },
        tooltip: {
            callbacks: {
                footer: function (context) {
                    return context[0].dataset.problems[context[0].dataIndex];
                }
            }
        }
    },
    scales: {
        x: {
            type: "time",
            display: true
        },
        y: {
            title: {
                display: true,
                text: "Kattis Score"
            },
            beginAtZero: true
        }
    }
};

const Chart = (props) => {
    const [chartData, setChartData] = useState({});
    const [empty, setEmpty] = useState(true);

    useEffect(() => {
        chrome.storage.local.get("submission_data", (res) => {
            if (res && res.submission_data) {
                const raw = JSON.parse(res.submission_data).data;
                raw.sort((a, b) => a.timestamp - b.timestamp);
                let data = [];
                let score = 0;
                for (let dp of raw) {
                    score += dp.difficulty;
                    data.push({ x: dp.timestamp, y: score, problem: dp.problem_name });
                }

                const new_data = {
                    labels: data.map((dp) => dp.x),
                    datasets: [{
                        label: "Kattis Score",
                        data: data.map((dp) => dp.y),
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                        problems: data.map((dp) => dp.problem)
                    }]
                };

                setChartData(new_data);
                setEmpty(false);
            }
        })
    }, []);

    return (
        <div>
            {!empty &&
                <Grid container spacing={2} style={{ width: "100%", margin: 0 }}>
                    <Grid item xs={12}>
                        <Line height="200px" data={chartData} options={options} />
                    </Grid>
                </Grid>
            }
            {empty &&
                <Grid container spacing={2} style={{ width: "100%", margin: 0, minHeight: "300px", textAlign: "center", alignItems: "center" }}>
                    <Grid item xs={12}>
                        <Typography>You haven't submitted any problems!</Typography>
                    </Grid>
                </Grid>
            }
        </div>
    );
}

export default Chart;