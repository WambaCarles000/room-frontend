"use client";

import Link from "next/link";

function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 text-zinc-950 flex items-center justify-center px-4">
      <main className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-zinc-900 mb-2">
            Compte Suspendu
          </h1>

          {/* Description */}
          <p className="text-center text-zinc-600 text-sm mb-6">
            Votre compte a été temporairement suspendu. Cela peut être dû à une violation de nos conditions d'utilisation ou à une activité suspecte.
          </p>

          {/* Message Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              Si vous pensez que c'est une erreur, veuillez contacter notre équipe support.
            </p>
          </div>

          {/* Contact Support Button */}
          <a
            href="mailto:cwamba35@gmail.com"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-center block mb-4 transition"
          >
            Contacter le Support
          </a>

          {/* Back to Home */}
          <Link
            href="/"
            className="w-full bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-medium py-2 px-4 rounded-lg text-center block transition"
          >
            Retour à l'accueil
          </Link>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            © 2025 Room. Tous les droits réservés.
          </p>
        </div>
      </main>
    </div>
  );
}

export default AccountSuspendedPage;
