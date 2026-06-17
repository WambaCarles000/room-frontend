export function toInputDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Même logique que toLocaleDateString — utilise l'heure locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

/** Ancienneté du compte propriétaire, ex. « Membre depuis 3 mois » */
export function formatMemberSince(dateStr) {
  if (!dateStr) return null;

  const joined = new Date(dateStr);
  if (Number.isNaN(joined.getTime())) return null;

  const now = new Date();
  const days = Math.floor((now - joined) / (1000 * 60 * 60 * 24));

  if (days < 1) return "Membre depuis aujourd'hui";
  if (days < 30) {
    return `Membre depuis ${days} jour${days > 1 ? "s" : ""}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Membre depuis ${months} mois`;
  }

  const years = Math.floor(months / 12);
  return `Membre depuis ${years} an${years > 1 ? "s" : ""}`;
}