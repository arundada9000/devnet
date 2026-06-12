export function exportContactsToCSV(contacts) {
  const headers = ["localGov", "department", "name", "phone", "email"];
  const rows = contacts.flatMap((c) =>
    (c.contacts || []).map((person) => [
      c.localGov,
      c.department,
      person.name,
      person.phone,
      person.email || "",
    ])
  );
  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseContactCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const result = [];
  const map = {};

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, idx) => (row[h] = vals[idx] || ""));
    const key = `${row.localGov}-${row.department}`;
    if (!map[key]) {
      map[key] = { localGov: row.localGov, department: row.department, contacts: [] };
      result.push(map[key]);
    }
    map[key].contacts.push({
      name: row.name,
      phone: row.phone,
      email: row.email,
    });
  }
  return result;
}
