type OpsData = {
  tasks: Array<{
    status: string;
    title: string;
    priority: string;
    owner: string;
  }>;
  fleet: Array<{
    status: string;
    name: string;
    site: string;
    issues: number;
  }>;
  employees: Array<{
    status: string;
    name: string;
    workload: number;
  }>;
  sites: Array<{
    risk: number;
    name: string;
    issues: number;
  }>;
  business?: {
    customers: Array<{ id: string; name: string; status: string; balance: number }>;
    invoices: Array<{ documentNumber: string; customerId: string; status: string; total: number }>;
    expenses: Array<{ total: number }>;
    tasks: Array<{ status: string; title: string; priorityScore: number }>;
  };
};

export type AIResult = {
  answer: string;
  action?: {
    type: "create_task";
    title: string;
    site: string;
    owner: string;
    description: string;
  } | {
    type: "create_business_task";
    title: string;
    description: string;
    customerId?: string;
  };
};

function includesAny(question: string, terms: string[]) {
  return terms.some((term) => question.includes(term));
}

export function askOpsAI(question: string, data: OpsData): AIResult {
  const q = question.toLowerCase().trim();
  const criticalFleet = data.fleet.filter((item) => item.status === "Critical");
  const openTasks = data.tasks.filter((item) => item.status !== "Done");
  const urgentTasks = openTasks.filter((item) =>
    ["Critical", "High"].includes(item.priority)
  );
  const availableEmployees = data.employees.filter(
    (item) => item.status === "Available"
  );
  const overloadedEmployees = data.employees.filter(
    (item) => item.workload >= 80
  );
  const highRiskSites = data.sites.filter((item) => item.risk >= 70);
  const overdueInvoices =
    data.business?.invoices.filter((item) => item.status === "Overdue") ?? [];

  if (includesAny(q, ["collection task", "משימת גבייה", "צור משימת גבייה"])) {
    const invoice = overdueInvoices[0];
    const customer = data.business?.customers.find((item) => item.id === invoice?.customerId);
    return {
      answer: invoice
        ? `I prepared a collection task for ${invoice.documentNumber}${customer ? ` (${customer.name})` : ""}. Approve it to add it to the Business Kanban.`
        : "There are no overdue invoices that require a collection task.",
      action: invoice ? {
        type: "create_business_task",
        title: `Collect payment for ${invoice.documentNumber}`,
        description: `Follow up on overdue balance of ${formatCurrency(invoice.total)}.`,
        customerId: invoice.customerId,
      } : undefined,
    };
  }

  if (includesAny(q, ["draft message", "message customer", "נסח הודעה", "הודעה ללקוח"])) {
    const invoice = overdueInvoices[0];
    const customer = data.business?.customers.find((item) => item.id === invoice?.customerId);
    return {
      answer: invoice
        ? `Draft message: Hi ${customer?.name ?? "there"}, this is a friendly reminder that invoice ${invoice.documentNumber} for ${formatCurrency(invoice.total)} is overdue. Please let us know when payment is expected or if you need any assistance. Thank you.`
        : "There is no overdue invoice to draft a reminder for.",
    };
  }

  if (includesAny(q, ["summarize today", "daily summary", "סכם את היום", "סיכום יומי"])) {
    return {
      answer: `Daily brief: ${openTasks.length} operational tasks remain open, ${criticalFleet.length} vehicles are critical, ${highRiskSites.length} sites are high-risk and ${overdueInvoices.length} invoices are overdue. ${availableEmployees.length} employees are currently available.`,
    };
  }

  if (
    includesAny(q, [
      "create maintenance",
      "maintenance task",
      "צור משימת תחזוקה",
      "תיצור משימת תחזוקה",
    ])
  ) {
    const vehicle = criticalFleet[0] ?? data.fleet[0];
    const owner = availableEmployees[0]?.name ?? "Unassigned";

    return {
      answer: `I prepared a maintenance task for ${vehicle?.name ?? "the selected vehicle"}. Review it before approval.`,
      action: {
        type: "create_task",
        title: `Maintenance inspection - ${vehicle?.name ?? "Vehicle"}`,
        site: vehicle?.site ?? "No site",
        owner,
        description: `AI-generated maintenance task for ${vehicle?.name ?? "vehicle"}. Inspect before deployment.`,
      },
    };
  }

  if (includesAny(q, ["recommend", "priority", "המלצה", "מה דחוף", "עדיפות"])) {
    const recommendations: string[] = [];

    if (criticalFleet.length) {
      recommendations.push(
        `Inspect ${criticalFleet.map((item) => item.name).join(", ")} before deployment`
      );
    }
    if (urgentTasks.length) {
      recommendations.push(`Resolve ${urgentTasks.length} high-priority tasks`);
    }
    if (highRiskSites.length) {
      recommendations.push(
        `Review ${highRiskSites.map((item) => item.name).join(", ")}`
      );
    }
    if (overloadedEmployees.length) {
      recommendations.push(
        `Rebalance workload for ${overloadedEmployees.map((item) => item.name).join(", ")}`
      );
    }
    if (overdueInvoices.length) {
      recommendations.push(
        `Collect ${formatCurrency(overdueInvoices.reduce((sum, item) => sum + item.total, 0))} from overdue invoices`
      );
    }

    return {
      answer: recommendations.length
        ? `Recommended next steps: ${recommendations.join(". ")}.`
        : "No urgent intervention is required. Continue monitoring normal operations.",
    };
  }

  if (includesAny(q, ["critical", "vehicles", "fleet", "רכבים", "צי"])) {
    return {
      answer: criticalFleet.length
        ? `Critical fleet: ${criticalFleet.map((item) => `${item.name} (${item.issues} issues)`).join(", ")}.`
        : "No critical vehicles detected. Fleet is currently stable.",
    };
  }

  if (includesAny(q, ["tasks", "task", "משימות", "משימה"])) {
    return {
      answer: `${openTasks.length} tasks are open, including ${urgentTasks.length} high-priority tasks. ${data.tasks.length} tasks are tracked in total.`,
    };
  }

  if (includesAny(q, ["available", "employees", "team", "פנוי", "עובדים", "צוות"])) {
    return {
      answer: availableEmployees.length
        ? `Available team members: ${availableEmployees.map((item) => item.name).join(", ")}.`
        : "No employees are currently marked as available.",
    };
  }

  if (includesAny(q, ["risk", "sites", "סיכון", "אתרים"])) {
    return {
      answer: highRiskSites.length
        ? `High-risk sites: ${highRiskSites.map((item) => `${item.name} (${item.risk}%)`).join(", ")}.`
        : "No high-risk sites detected.",
    };
  }

  if (
    includesAny(q, [
      "business",
      "revenue",
      "invoice",
      "customers",
      "עסק",
      "הכנסות",
      "חשבוניות",
      "לקוחות",
    ])
  ) {
    if (!data.business) {
      return { answer: "Business data is currently unavailable." };
    }

    const activeCustomers = data.business.customers.filter(
      (item) => item.status === "Active"
    ).length;
    const invoiceTotal = data.business.invoices.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const expenseTotal = data.business.expenses.reduce(
      (sum, item) => sum + item.total,
      0
    );

    return {
      answer: `Business summary: ${activeCustomers} active customers, ${formatCurrency(invoiceTotal)} invoiced, ${formatCurrency(expenseTotal)} in expenses and ${overdueInvoices.length} overdue invoices.`,
    };
  }

  return {
    answer: `Operational summary: ${openTasks.length} open tasks, ${criticalFleet.length} critical vehicles, ${availableEmployees.length} available employees and ${highRiskSites.length} high-risk sites. Ask me for recommendations to decide what to do next.`,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}
