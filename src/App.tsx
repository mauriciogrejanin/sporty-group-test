import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LeaguesPage } from './leagues/LeaguesPage';

function App() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            Sports Leagues
          </Typography>
        </Toolbar>
      </AppBar>
      <LeaguesPage />
    </>
  );
}

export default App;
