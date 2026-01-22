import { useState, useRef } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useExportImport } from "~/hooks/useStorage";

export default function Settings() {
  const {
    exportData,
    importData,
    clearData,
    exporting,
    importing,
    error,
  } = useExportImport();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setLocalError(null);
      setLocalSuccess(null);
      await exportData();
      setLocalSuccess("Data exported successfully!");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLocalError(null);
      setLocalSuccess(null);
      await importData(file);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleClear = async () => {
    if (
      confirm(
        "Are you sure you want to delete ALL data? This cannot be undone. Make sure you've exported your data first!"
      )
    ) {
      try {
        setLocalError(null);
        setLocalSuccess(null);
        await clearData();
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Clear failed");
      }
    }
  };

  const displayError = error || localError;
  const displaySuccess = localSuccess;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <h1>Settings</h1>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError}
        </Alert>
      )}
      {displaySuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {displaySuccess}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Download all your vaccine records as a JSON file. You can import this
          file on another device or use it as a backup.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export Data"}
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Import Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Import vaccine records from a previously exported JSON file. This will
          replace all current data.
        </Typography>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          style={{ display: "none" }}
        />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          {importing ? "Importing..." : "Import Data"}
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={2} sx={{ p: 3, backgroundColor: "#fff3e0" }}>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Permanently delete all data including family members, vaccine records,
          and settings. This action cannot be undone.
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={handleClear}
        >
          Clear All Data
        </Button>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> All data is stored locally in your browser.
          No information is sent to any server. Export your data regularly to
          prevent loss.
        </Typography>
      </Box>
    </div>
  );
}
