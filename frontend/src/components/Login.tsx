import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();
const loginImage = "/loginImage.jpg";

function SignInSide() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError(null);
    setUsername("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 0) {
        // Login
        await login(username, password);
      } else {
        // Register
        await register(username, name, email || undefined, password);
      }
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tab === 0
            ? "Login failed"
            : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${loginImage})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              {tab === 0 ? <LockOutlinedIcon /> : <PersonAddIcon />}
            </Avatar>
            <Typography component="h1" variant="h5">
              {tab === 0 ? "Sign in" : "Sign up"}
            </Typography>
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              {tab === 1 && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email (optional)"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete={tab === 0 ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading
                  ? tab === 0
                    ? "Signing in..."
                    : "Registering..."
                  : tab === 0
                    ? "Sign In"
                    : "Sign Up"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

function Login() {
  return (
    <div>
      <SignInSide />
    </div>
  );
}

export default Login;
