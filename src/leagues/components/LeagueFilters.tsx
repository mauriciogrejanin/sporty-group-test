import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, IconButton } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { LeagueFilters as Filters } from '../utils/filterLeagues';

interface LeagueFiltersProps {
  filters: Filters;
  sports: string[];
  onQueryChange: (query: string) => void;
  onSportChange: (sport: string) => void;
}

export function LeagueFilters({
  filters,
  sports,
  onQueryChange,
  onSportChange,
}: LeagueFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        label="Search leagues"
        value={filters.query}
        onChange={(event) => onQueryChange(event.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="Clear" onClick={() => onQueryChange('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <FormControl sx={{ minWidth: { sm: 220 } }}>
        <InputLabel id="sport-filter-label" shrink>
          Sport
        </InputLabel>
        <Select
          labelId="sport-filter-label"
          label="Sport"
          notched
          value={filters.sport}
          onChange={(event: SelectChangeEvent<string>) => onSportChange(event.target.value)}
          displayEmpty
        >
          <MenuItem value="">All sports</MenuItem>
          {sports.map((sport) => (
            <MenuItem key={sport} value={sport}>
              {sport}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
