import Button from "@material-ui/core/Button";
import GitHubIcon from "@material-ui/icons/GitHub";


const App = () => {
  return (
    <div>
      <Button variant="outlined">
        <GitHubIcon />
        &nbsp;Authorize
      </Button>
    </div>
  );
}

export default App;
