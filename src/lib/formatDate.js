export function toInputDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Même logique que toLocaleDateString — utilise l'heure locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }