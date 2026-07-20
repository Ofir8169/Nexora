function normalizeNumber(value, fallback = 0) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return Math.max(0, Math.min(number, 10));
}

export function calculatePriorityScore(task) {
  const urgency = normalizeNumber(task.urgency);
  const businessValue = normalizeNumber(task.businessValue);
  const risk = normalizeNumber(task.risk);
  const customerImportance = normalizeNumber(
    task.customerImportance
  );

  const weightedScore =
    urgency * 0.35 +
    businessValue * 0.25 +
    risk * 0.2 +
    customerImportance * 0.2;

  return Math.round(weightedScore * 10);
}

export function getPriorityLabel(score) {
  if (score >= 85) {
    return "Critical";
  }

  if (score >= 70) {
    return "High";
  }

  if (score >= 45) {
    return "Medium";
  }

  return "Low";
}