"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import api from "@/lib/api";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }
      setUser(user);
      fetchReports();
    });
  }, []);

  async function fetchReports() {
    try {
      const data = await api.get('/reports', { auth: true });
      setReports(data || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function updateReportStatus(reportId, status, notes) {
    try {
      setUpdatingStatus(prev => ({ ...prev, [reportId]: true }));
      const updatedReport = await api.patch(`/reports/${reportId}/status`, { status, admin_notes: notes }, { auth: true });
      setReports(reports.map(r => r.id === reportId ? updatedReport : r));
      setExpandedReport(null);
      setAdminNotes("");
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [reportId]: false }));
    }
  }

  async function suspendUser(reportId) {
    if (!confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) return;

    try {
      setUpdatingStatus(prev => ({ ...prev, [reportId]: true }));
      const result = await api.post(`/reports/${reportId}/suspend-user`, null, { auth: true });
      alert(result.message);
      fetchReports();
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [reportId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Chargement des reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Reports (admin)</h1>
          <p className="text-zinc-600 dark:text-zinc-300">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucun report</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div 
                  className="px-6 py-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-zinc-500">{r.reason}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          r.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          r.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-zinc-900 dark:text-zinc-100 mb-1">{r.description}</p>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Reporté par: {r.reported_by?.email} 
                        {r.reported_user && ` | Cible: ${r.reported_user?.email}`}
                        {r.listing && ` | Listing: ${r.listing?.id}`}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-zinc-500">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {expandedReport === r.id && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-800">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Notes admin
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md dark:bg-zinc-900 dark:text-white text-sm"
                          rows="3"
                          placeholder="Ajouter des notes..."
                        />
                      </div>

                      {r.admin_notes && (
                        <div className="text-sm bg-zinc-200 dark:bg-zinc-700 p-2 rounded">
                          <strong>Notes précédentes:</strong> {r.admin_notes}
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => updateReportStatus(r.id, 'reviewed', adminNotes)}
                          disabled={updatingStatus[r.id]}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50"
                        >
                          Marquer comme examiné
                        </button>
                        <button
                          onClick={() => updateReportStatus(r.id, 'dismissed', adminNotes)}
                          disabled={updatingStatus[r.id]}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md disabled:opacity-50"
                        >
                          Rejeter
                        </button>
                        {r.reported_user && (
                          <button
                            onClick={() => suspendUser(r.id)}
                            disabled={updatingStatus[r.id]}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md disabled:opacity-50"
                          >
                            Suspendre l'utilisateur
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}