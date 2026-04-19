import { Card, CardContent, Typography, Chip } from "@mui/material";

export default function EncounterCard({ encounter, verified }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{encounter.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {encounter.date}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          {encounter.summary}
        </Typography>

        <div style={{ marginTop: "10px" }}>
          {verified === true && (
            <Chip label="Verified" color="success" size="small" />
          )}

          {verified === false && (
            <Chip label="Tampered" color="error" size="small" />
          )}

          {verified === undefined && (
            <Chip label="Not Verified" color="warning" size="small" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
