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
  FaShare,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaTimes,
} from "react-icons/fa";

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

  const shareUrl = listingUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listingId}`;
  const shareTitle = listingTitle || "Découvrez ce logement";
  const shareMessage = `${shareTitle} - Room`;

  return (
    <div className="relative inline-block">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-center font-medium text-zinc-900 transition hover:bg-zinc-200"
      >
     
        Partager
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Partager sur</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <FaTimes size={14} className="text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="p-2 space-y-1">
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
                      <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                        <PlatformIcon size={16} className="text-gray-600" />
                        <span className="font-medium">{platform.label}</span>
                      </div>
                    </PlatformComponent>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}