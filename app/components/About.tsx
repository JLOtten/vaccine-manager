import GitHubIcon from "@mui/icons-material/GitHub";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function About() {
  return (
    <Box sx={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        About Vaccine Manager
      </Typography>

      <Typography variant="body1" paragraph>
        Vaccine Manager is a local-first application for tracking vaccination
        records for you and your family members.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Features
      </Typography>
      <Box component="ul" sx={{ lineHeight: 1.8 }}>
        <li>Track vaccinations for multiple family members</li>
        <li>Record vaccine details including date, location, and dosage</li>
        <li>View vaccination history by family member</li>
        <li>Export and import data as JSON files</li>
        <li>All data stored locally in your browser for privacy</li>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Privacy & Data Security
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>Your data never leaves your browser.</strong> All vaccination
        records are stored locally in your browser's storage. No information is
        sent to any server or external service. You maintain complete control
        over your data and can export it at any time to use on another device.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Disclaimer
      </Typography>
      <Typography variant="body1" paragraph>
        This application is provided for informational and record-keeping
        purposes only. It is not intended to provide medical advice, diagnosis,
        or treatment. Always consult with qualified healthcare professionals
        regarding vaccination decisions and medical questions.
      </Typography>

      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
        <Link
          href="https://github.com/cmiller01/vaccine-manager"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "primary.main",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <GitHubIcon />
          <Typography variant="body1">View on GitHub</Typography>
        </Link>
      </Box>
    </Box>
  );
}
