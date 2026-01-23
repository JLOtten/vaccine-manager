import { Link } from "react-router";
import ArticleIcon from "@mui/icons-material/Article";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function Home() {
  const cards = [
    {
      to: "/family-members",
      icon: <PersonAddAltIcon sx={{ fontSize: 80 }} />,
      label: "Manage Family Members",
    },
    {
      to: "/view-records",
      icon: <ArticleIcon sx={{ fontSize: 80 }} />,
      label: "View Vaccine Records",
    },
    {
      to: "/add-vaccine",
      icon: <EditNoteIcon sx={{ fontSize: 80 }} />,
      label: "Record New Vaccine",
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          color: "primary.dark",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to your vaccine manager!
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary">
          Choose an option below:
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <Paper
              key={card.to}
              component={Link}
              to={card.to}
              elevation={3}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "15px",
                padding: "30px",
                minWidth: "250px",
                minHeight: "200px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <Box
                sx={{
                  color: "white",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Typography variant="h6" component="div" fontWeight={600}>
                  {card.label}
                </Typography>
                {card.icon}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
