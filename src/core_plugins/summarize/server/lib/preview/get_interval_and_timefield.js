export default function getIntervalAndTimefield(panel) {
  const timeField = panel.time_field;
  const interval = panel.interval;
  return { timeField, interval };
}
