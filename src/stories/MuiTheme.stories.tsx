import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Rating,
  Slider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { CHEVERUS } from '../theme/theme';

const meta = {
  title: 'Foundations/MUI Theme',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}

export const Palette: Story = {
  render: () => (
    <Stack spacing={1}>
      {Object.entries(CHEVERUS).map(([name, hex]) => (
        <Stack key={name} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: hex, border: 1, borderColor: 'divider' }} />
          <Box>
            <Typography variant="subtitle2">{name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {hex}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Typography_: Story = {
  name: 'Typography',
  render: () => (
    <Stack spacing={1}>
      <Typography variant="h1">h1 · Lunch Planner</Typography>
      <Typography variant="h2">h2 · Draft the email</Typography>
      <Typography variant="h3">h3 · Choose a drink</Typography>
      <Typography variant="subtitle1">subtitle1 · Meatball Sub</Typography>
      <Typography variant="body1">body1 · Every meal comes complete with fruit, milk and veggies.</Typography>
      <Typography variant="body2">body2 · Menus are subject to change.</Typography>
      <Typography variant="caption">caption · Dismissal – 5:30 PM</Typography>
      <Typography variant="overline">overline · Step 1</Typography>
    </Stack>
  ),
};

export const Inputs: Story = {
  render: () => (
    <>
      <Section title="Buttons">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">
            Secondary
          </Button>
          <Button variant="outlined">Outlined</Button>
          <Button>Text</Button>
          <IconButton color="primary" aria-label="favorite">
            <FavoriteRoundedIcon />
          </IconButton>
        </Stack>
      </Section>
      <Section title="Chips">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip label="Vegetarian" color="secondary" />
          <Chip label="Green Beans" color="primary" />
          <Chip label="Celery Sticks" variant="outlined" onClick={() => {}} />
        </Stack>
      </Section>
      <Section title="Toggle buttons">
        <ToggleButtonGroup exclusive value="1%" size="small" color="primary">
          <ToggleButton value="1%">1% Milk</ToggleButton>
          <ToggleButton value="ff">Fat-Free</ToggleButton>
          <ToggleButton value="none">None</ToggleButton>
        </ToggleButtonGroup>
      </Section>
      <Section title="Selection controls">
        <RadioGroup defaultValue="hot">
          <FormControlLabel value="hot" control={<Radio />} label="Hot lunch" />
          <FormControlLabel value="home" control={<Radio />} label="Packing lunch" />
        </RadioGroup>
        <FormControlLabel control={<Checkbox defaultChecked />} label="Grab & Go breakfast" />
        <FormControlLabel control={<Switch defaultChecked />} label="Extended Day" />
      </Section>
      <Section title="Text field, slider, rating">
        <Stack spacing={2}>
          <TextField label="Child's name" size="small" />
          <Slider defaultValue={60} aria-label="Slider" />
          <Rating defaultValue={4} />
        </Stack>
      </Section>
    </>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <>
      <Section title="Card">
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              “Mama Mia” · Hot lunch
            </Typography>
            <Typography variant="h3">Meatball Sub</Typography>
            <Typography variant="body2" color="text.secondary">
              Green Beans · Celery Sticks · Juicy Apple
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Choose</Button>
          </CardActions>
        </Card>
      </Section>
      <Section title="Accordion">
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>Fruit & veggie bar</AccordionSummary>
          <AccordionDetails>Carrots, cucumbers, tomatoes, celery sticks…</AccordionDetails>
        </Accordion>
      </Section>
      <Section title="List">
        <List dense disablePadding>
          {['Dinner Roll', 'Green Beans', 'Juicy Apple'].map((item) => (
            <ListItem key={item}>
              <ListItemIcon>
                <LunchDiningRoundedIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Section>
    </>
  ),
};

export const Feedback: Story = {
  render: () => (
    <>
      <Section title="Alerts">
        <Stack spacing={1}>
          <Alert severity="success">Email copied</Alert>
          <Alert severity="warning">Menus are subject to change.</Alert>
        </Stack>
      </Section>
      <Section title="Progress">
        <LinearProgress variant="determinate" value={60} />
      </Section>
      <Section title="Stepper">
        <Stepper activeStep={1} alternativeLabel>
          {['Lunch', 'Drink', 'EDP'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Section>
      <Section title="Avatar & badge">
        <Badge badgeContent={3} color="secondary">
          <Avatar sx={{ bgcolor: 'primary.main' }}>S</Avatar>
        </Badge>
      </Section>
    </>
  ),
};

export const Navigation: Story = {
  render: () => (
    <>
      <Section title="Tabs">
        <Tabs value={1} variant="fullWidth">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
            <Tab key={d} label={d} />
          ))}
        </Tabs>
      </Section>
      <Divider />
      <Section title="Bottom navigation">
        <BottomNavigation showLabels value={0}>
          <BottomNavigationAction label="Plan" icon={<LunchDiningRoundedIcon />} />
          <BottomNavigationAction label="Favorites" icon={<FavoriteRoundedIcon />} />
        </BottomNavigation>
      </Section>
    </>
  ),
};
