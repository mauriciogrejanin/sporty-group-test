import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';
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
