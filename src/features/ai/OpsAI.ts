type OpsData = {
  tasks: any[];
  fleet: any[];
  employees: any[];
  sites: any[];
};

export type AIResult = {
  answer: string;
  action?: {
    type: "create_task";
    title: string;
    site: string;
    owner: string;
    description: string;
  };
};

export function askOpsAI(question: string, data: OpsData): AIResult {
  const q = question.toLowerCase();

  const criticalFleet = data.fleet.filter((v) => v.status === "Critical");
  const openTasks = data.tasks.filter((t) => t.status !== "Done");
  const availableEmployees = data.employees.filter(
    (e) => e.status === "Available"
  );
  const highRiskSites = data.sites.filter((s) => s.risk >= 70);

  if (
    q.includes("create maintenance") ||
    q.includes("maintenance task") ||
    q.includes("צור משימת תחזוקה")
  ) {
    const vehicle = criticalFleet[0] || data.fleet[0];
    const owner = availableEmployees[0]?.name || "Unassigned";

    return {
      answer: `I can create a maintenance task for ${vehicle?.name || "selected vehicle"} and assign it to ${owner}.`,
      action: {
        type: "create_task",
        title: `Maintenance inspection - ${vehicle?.name || "Vehicle"}`,
        site: vehicle?.site || "No site",
        owner,
        description: `AI generated maintenance task for ${vehicle?.name || "vehicle"}. Inspect before deployment.`,
      },
    };
  }

  if (q.includes("critical") || q.includes("רכבים")) {
    if (criticalFleet.length === 0) {
      return { answer: "No critical vehicles detected. Fleet is currently stable." };
    }

    return {
      answer: `Critical vehicles: ${criticalFleet
        .map((v) => v.name)
        .join(", ")}. Recommendation: inspect before deployment.`,
    };
  }

  if (q.includes("tasks") || q.includes("משימות")) {
    return {
      answer: `There are ${openTasks.length} open tasks. ${data.tasks.length} total tasks are tracked.`,
    };
  }

  if (q.includes("available") || q.includes("פנוי")) {
    return {
      answer: `Available employees: ${
        availableEmployees.map((e) => e.name).join(", ") || "none"
      }.`,
    };
  }

  if (q.includes("risk") || q.includes("סיכון")) {
    if (highRiskSites.length === 0) {
      return { answer: "No high-risk sites detected." };
    }

    return {
      answer: `High-risk sites: ${highRiskSites
        .map((s) => `${s.name} (${s.risk}%)`)
        .join(", ")}.`,
    };
  }

  return {
    answer: `Operational summary: ${data.tasks.length} tasks, ${data.fleet.length} vehicles, ${data.employees.length} employees, ${data.sites.length} sites.`,
  };
}