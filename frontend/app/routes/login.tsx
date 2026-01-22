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
import { useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json, useActionData, Form, useNavigation } from "@remix-run/react";
import { getSession, commitSession, getAuthStatus } from "~/utils/session.server";
import { api } from "~/utils/api";

const defaultTheme = createTheme();
const loginImage = "/loginImage.jpg";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAuthenticated = await getAuthStatus(request);
  if (isAuthenticated) {
    return redirect("/");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    if (actionType === "login") {
      await api.login({ username, password });
    } else if (actionType === "register") {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      await api.register({ username, name, email: email || undefined, password });
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("isAuthenticated", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Authentication failed" }, { status: 400 });
  }
}

function SignInSide() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loading = navigation.state === "submitting";

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setUsername("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("actionType", tab === 0 ? "login" : "register");

    const form = event.currentTarget;
    const method = form.method;
    const action = form.action;

    await fetch(action, {
      method,
      body: formData,
    }).then(async (response) => {
      if (response.ok) {
        navigate("/");
      }
    });
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
              method="post"
              sx={{ mt: 1 }}
            >
              {actionData?.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {actionData.error}
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

export default function Login() {
  return (
    <div>
      <SignInSide />
    </div>
  );
}
