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
    exportJSON,
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
      setLocalSuccess("CRDT data exported successfully!");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleExportJSON = async () => {
    try {
      setLocalError(null);
      setLocalSuccess(null);
      await exportJSON();
      setLocalSuccess("JSON exported successfully!");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "JSON export failed");
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
        "Are you sure you want to delete ALL data? This cannot be undone. Make sure you've exported your data first!",
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
          Download your vaccine records. Choose the format based on your needs:
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CRDT (.crdt)"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export JSON (.json)"}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>.crdt files:</strong> Importable format that merges with
          existing data. Use this to sync records across devices or combine data
          from multiple sources.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>.json files:</strong> Human-readable format for viewing or
          sharing. Cannot be imported back into the app.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Import Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Import vaccine records from a .crdt file. Data will be merged with
          your existing records - no data will be lost. You can import multiple
          files sequentially to combine records from different sources.
        </Typography>
        <input
          type="file"
          accept=".crdt"
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
          {importing ? "Importing..." : "Import CRDT File"}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Note:</strong> Only .crdt files can be imported. JSON files
          are read-only and cannot be imported.
        </Typography>
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
          <strong>Note:</strong> All data is stored locally in your browser. No
          information is sent to any server. Export your data regularly to
          prevent loss.
        </Typography>
      </Box>
    </div>
  );
}
