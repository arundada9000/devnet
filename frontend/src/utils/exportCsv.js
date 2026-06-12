export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    return;
  }

  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        acc[pre + k] = obj[k].map(item => typeof item === 'object' ? JSON.stringify(item) : item).join('; ');
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const flattenedData = data.map(item => flattenObject(item));
  const headers = Array.from(new Set(flattenedData.flatMap(Object.keys)));

  const csvContent = [
    headers.join(","),
    ...flattenedData.map(row =>
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? "" : String(row[header]);
        if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
