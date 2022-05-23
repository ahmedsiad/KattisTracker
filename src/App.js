/*global chrome*/
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import GitHubIcon from "@material-ui/icons/GitHub";
import { withStyles } from "@material-ui/core/styles";
import { useState, useEffect } from "react";
import Home from "./components/Home";

const CLIENT_ID = "5e5df0d6da9ae0a3e442";

const BlueText = withStyles({
  root: {
    background: "-webkit-linear-gradient(0deg, #007EFE 20%, #0059B3 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bolder"   
  }
})(Box);

const App = () => {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("access_token", (data) => {
      if (data && data.access_token) {
        // try to get user object
        fetch("https://api.github.com/user", {
          method: "GET",
          headers: { Authorization: `token ${data.access_token}` }
        }).then((response) => {
          // might also include 304 here
          if (response.status === 200) {
            setAuthorized(true);
          }
          else {
            chrome.storage.local.set({ access_token: null });
          }
        });
      }
    });
  }, []);

  const authorizeClick = (event) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;

    chrome.storage.local.set({ sent_github: true }, () => {
      chrome.tabs.create({ url, active: true }, () => {

      });
    });
  };

  return (
    <div>
      <AppBar position="static" style={{backgroundColor: "#F7F7F7"}}>
        <Toolbar>
          <Typography variant="h5" style={{flexGrow: "1"}}>
            <BlueText component="span">Kattis Tracker</BlueText>
          </Typography>
          <Tooltip title="Repository">
            <IconButton target="_blank" href="https://github.com/ahmedsiad/KattisTracker">
              <GitHubIcon style={{fill: "#171515"}} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {!authorized && 
        <Grid container spacing={2} style={{width: "100%", margin: 0, marginTop: "10px", textAlign: "center"}}>
          <Grid item xs={12}>
            <Typography variant="h6">Use the button below to link your GitHub account with Kattis Tracker!</Typography>
          </Grid>
          <Grid item xs={12} style={{marginTop: "50px", minHeight: "100px", justifyContent: "center"}}>
            <Button variant="outlined" onClick={(event) => authorizeClick(event)}>
              <GitHubIcon />
              &nbsp;Authorize
            </Button>
          </Grid>
        </Grid>
      }
      {authorized && <Home />}
    </div>
  );
}

export default App;
