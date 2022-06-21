/*global chrome*/
import { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import BarChartIcon from "@material-ui/icons/BarChart";
import SettingsIcon from "@material-ui/icons/Settings";
import Chart from "./Chart";
import Stats from "./Stats";
import Settings from "./Settings";


const Home = (props) => {
    const [tab, setTab] = useState("chart");

    useEffect(() => {
        chrome.storage.local.get(["repo_name", "access_token"], (data) => {
            if (data && data.access_token && !data.repo_name) {
                setTab("settings");
            }
        })
    }, []);

    const onBottomChange = (event, newValue) => {
        setTab(newValue);
    }

    return (
        <div>
            <BottomNavigation style={{ width: "100%", position: "fixed", bottom: "0", backgroundColor: "#F7F7F7" }}
                showLabels value={tab} onChange={onBottomChange}>
                <BottomNavigationAction label="Chart" value="chart" icon={<ShowChartIcon />} />
                <BottomNavigationAction label="Stats" value="stats" icon={<BarChartIcon />} />
                <BottomNavigationAction label="Settings" value="settings" icon={<SettingsIcon />} />
            </BottomNavigation>

            {tab === "chart" ? <Chart /> : null}
            {tab === "stats" ? <Stats /> : null}
            {tab === "settings" ? <Settings authorized={props.authorized} /> : null}

        </div>
    );
}

export default Home;