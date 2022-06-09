/*global chrome*/
import { useState, useEffect } from "react";
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Select from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from '@material-ui/core/InputLabel';

const Settings = (props) => {
    const [repos, setRepos] = useState([]);
    const [uploadRepo, setUploadRepo] = useState("");
    const [lastSync, setLastSync] = useState("");

    const handleRepoChange = (event) => {
        setUploadRepo(event.target.value);
        chrome.storage.local.set({ repo_name: event.target.value });
    };

    const handleClear = (event) => {
        chrome.storage.local.set({ submission_data: null });
    }

    useEffect(() => {
        chrome.storage.local.get("access_token", (data) => {
            if (data && data.access_token) {
                fetch("https://api.github.com/user/repos", {
                    method: "GET",
                    headers: { Authorization: `token ${data.access_token}` }
                }).then((response) => {
                    return response.json();
                }).then((res) => {
                    let repoNames = [];
                    for (let repo of res) {
                        repoNames.push({ name: repo.name, full_name: repo.full_name });
                    }
                    repoNames.sort((a, b) => a.name.localeCompare(b.name));
                    setRepos([...repoNames]);
                })
            }
        });
        chrome.storage.local.get("repo_name", (data) => {
            if (data && data.repo_name) {
                setUploadRepo(data.repo_name);
            }
        });
        chrome.storage.local.get("last_sync", (data) => {
            if (data && data.last_sync) {
                setLastSync(data.last_sync);
            }
        });
    }, []);

    return (
        <div>
            <Grid container spacing={2} style={{ width: "100%", margin: 0, marginTop: "10px", textAlign: "center" }}>
                <Grid item xs={12}>
                    <Typography variant="h6">Choose one of your repositories to upload solutions to.</Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="outlined" style={{ minWidth: "150px", textAlign: "left" }}>
                        <InputLabel>Repository</InputLabel>
                        <Select label="Repository" value={uploadRepo} onChange={handleRepoChange}>
                            <MenuItem value={""}>None</MenuItem>
                            {repos.map((repo, idx) => (
                                <MenuItem key={idx} value={repo.full_name}>{repo.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6">Clear ALL Data</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="outlined" color="secondary" onClick={handleClear}>Clear Data</Button>
                </Grid>

                <Grid item xs={12}>
                    {lastSync && <Typography variant="body2">Last Synced: {lastSync}</Typography>}
                </Grid>
            </Grid>
        </div>
    );
}

export default Settings;