/*global chrome*/
import { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Tooltip from "@material-ui/core/Tooltip";

const RedText = withStyles({
    root: {
        background: "-webkit-linear-gradient(0deg, #FF5695 20%, #FF196F 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "bolder"
    }
})(Box);

const YellowText = withStyles({
    root: {
        background: "-webkit-linear-gradient(0deg, #FFD042 20%, #FFBF00 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "bolder"
    }
})(Box);

const GreenText = withStyles({
    root: {
        background: "-webkit-linear-gradient(0deg, #00C4AD 20%, #00AC98 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "bolder"
    }
})(Box);



const Stats = (props) => {
    const [totalProblems, setTotalProblems] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [hardestProblem, setHardestProblem] = useState({ problem_name: "", url: "" });
    const [hardProblems, setHardProblems] = useState(0);
    const [mediumProblems, setMediumProblems] = useState(0);
    const [easyProblems, setEasyProblems] = useState(0);
    const [empty, setEmpty] = useState(true);

    useEffect(() => {
        chrome.storage.local.get("submission_data", (res) => {
            if (res && res.submission_data) {
                const raw = JSON.parse(res.submission_data).data;
                raw.sort((a, b) => a.timestamp - b.timestamp);
                let streaks = [0];
                let [hardest, hardestP] = [0, {}];
                let [hards, meds, easys] = [0, 0, 0];

                for (let i = 0; i < raw.length; i++) {
                    const prob = raw[i];

                    if (prob.difficulty >= 5) hards++;
                    else if (prob.difficulty >= 3) meds++;
                    else easys++;

                    if (prob.difficulty > hardest) {
                        hardest = prob.difficulty;
                        hardestP = { problem_name: prob.problem_name, url: prob.problem_id };
                    }

                    if (streaks[streaks.length - 1] === 0) {
                        streaks[streaks.length - 1] = prob.timestamp;
                    }
                    else {
                        let curr = prob.timestamp;
                        let last = raw[i - 1].timestamp;
                        if (curr - last > 86400 * 1000) {
                            let days = Math.floor((last - streaks[streaks.length - 1]) / (86400 * 1000)) + 1;
                            streaks[streaks.length - 1] = days;
                            streaks.push(curr);
                        }
                    }
                }
                let lastDays = Math.floor((raw[raw.length - 1].timestamp - streaks[streaks.length - 1]) / (86400 * 1000)) + 1;
                streaks[streaks.length - 1] = lastDays;

                setTotalProblems(raw.length);
                setCurrentStreak(streaks[streaks.length - 1]);
                setLongestStreak(Math.max(...streaks));
                setHardestProblem(hardestP);
                setHardProblems(hards);
                setMediumProblems(meds);
                setEasyProblems(easys);
                setEmpty(false);
            }
        });
    }, []);

    return (
        <div>
            {!empty &&
                <div>
                    <Grid container spacing={2} style={{ width: "100%", margin: 0, marginTop: "10px" }}>
                        <Grid item xs={6}>
                            <Typography>Total Problems</Typography>
                        </Grid>
                        <Grid item xs={6} style={{ textAlign: "right" }}>
                            <Typography>{totalProblems}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography>Current Streak</Typography>
                        </Grid>
                        <Grid item xs={6} style={{ textAlign: "right" }}>
                            <Typography>{currentStreak} days</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography>Longest Streak</Typography>
                        </Grid>
                        <Grid item xs={6} style={{ textAlign: "right" }}>
                            <Typography>{longestStreak} days</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography>Hardest Problem</Typography>
                        </Grid>
                        <Grid item xs={6} style={{ textAlign: "right" }}>
                            <Link variant="body1" target="_blank" href={hardestProblem.url}>{hardestProblem.problem_name}</Link>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} style={{ width: "100%", margin: 0, marginTop: "15px", textAlign: "center" }}>
                        <Grid item xs={1} />
                        <Grid item xs={3}>
                            <Tooltip title="Difficulty greater than 5.0" arrow placement="top">
                                <Typography><RedText component="span">Hards</RedText></Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title="Difficulty between 3.0 and 5.0" arrow placement="top">
                                <Typography><YellowText component="span">Mediums</YellowText></Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={3}>
                            <Tooltip title="Difficulty less than 3.0" arrow placement="top">
                                <Typography><GreenText component="span">Easys</GreenText></Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={1} />

                        <Grid item xs={1} />
                        <Grid item xs={3}>
                            <Typography>{hardProblems}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography>{mediumProblems}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography>{easyProblems}</Typography>
                        </Grid>
                    </Grid>
                </div>
            }
        </div>
    );
}

export default Stats;