"use client";

import { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "react-share";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaTimes,
} from "react-icons/fa";
import { MdContentCopy, MdIosShare } from "react-icons/md";
import Popup from "@/components/popups";

const SHARE_PLATFORMS = [
  {
    id: "facebook",
    label: "Facebook",
    Component: FacebookShareButton,
    Icon: FaFacebook,
  },
  {
    id: "twitter",
    label: "Twitter / X",
    Component: TwitterShareButton,
    Icon: FaTwitter,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    Component: LinkedinShareButton,
    Icon: FaLinkedin,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    Component: WhatsappShareButton,
    Icon: FaWhatsapp,
  },
  {
    id: "email",
    label: "Email",
    Component: EmailShareButton,
    Icon: FaEnvelope,
  },
];

export default function ShareButton({ listingId, listingTitle, listingUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  const rawShareUrl = listingUrl || `${process.env.NEXT_PUBLIC_SITE_URL || ""}/listings/${listingId}`;
  const shareUrl = rawShareUrl.trim().replace(/\s+/g, "");
  const shareTitle = listingTitle || "Découvrez ce logement";
  const shareMessage = `${shareTitle} - Room`;

  async function copyLink() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        return;
      } catch {
        // Continue with the legacy copy method when clipboard permission is denied.
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) throw new Error("Clipboard copy failed");
  }

  async function handleCopyLink() {
    try {
      await copyLink();
      setIsOpen(false);
      Popup("Lien copié avec succès", "success");
    } catch {
      Popup("Impossible de copier le lien", "error");
    }
  }

  const menuContent = (
    <>
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">Partager sur</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer le menu de partage"
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100"
        >
          <FaTimes size={14} />
        </button>
      </div>

      <div className="space-y-1 p-2">
        {SHARE_PLATFORMS.map((platform) => {
          const PlatformComponent = platform.Component;
          const PlatformIcon = platform.Icon;

          return (
            <div key={platform.id} onClick={() => setIsOpen(false)}>
              <PlatformComponent
                url={shareUrl}
                title={shareTitle}
                body={shareMessage}
                separator=" - "
                quote={shareMessage}
                className="w-full"
              >
                <div className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50">
                  <PlatformIcon size={16} className="text-zinc-600" />
                  <span className="font-medium">{platform.label}</span>
                </div>
              </PlatformComponent>
            </div>
          );
        })}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <MdContentCopy aria-hidden="true" className="h-4 w-4 text-zinc-600" />
          <span className="font-medium">Copier le lien</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Partager ce logement"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Partager ce logement"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <MdIosShare aria-hidden="true" className="h-5 w-5" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:hidden">
            {menuContent}
          </div>
          <div className="absolute right-0 top-full z-50 mt-2 hidden w-56 rounded-lg border border-zinc-200 bg-white shadow-lg sm:block">
            {menuContent}
          </div>
        </>
      )}
    </div>
  );
}