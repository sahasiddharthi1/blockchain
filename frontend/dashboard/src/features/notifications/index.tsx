// STATUS: scaffold placeholder for the notifications feature.
// Per feature-based architecture, this folder will own:
//   - components/   (feature-local UI, not shared)
//   - hooks/         (data-fetching via @tanstack/react-query against the API)
//   - api.ts         (typed fetch calls to /api/v1/...)
//   - useLiveUpdates (WebSocket subscription to the relevant topic, see
//                      backend/internal/websocket)
// Real-time fields on this page should come from the WebSocket hub, not
// polling — that's the whole point of the backend's websocket package.
export default function Notifications() {
  return (
    <section>
      <h1>Notifications</h1>
      <p>Scaffold — implementation pending.</p>
    </section>
  );
}
