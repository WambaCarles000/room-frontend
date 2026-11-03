"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import RoomLoader from "@/components/RoomLoader";

export default function SettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <RoomLoader size="md" label="Chargement des paramètres" />
      </div>
    );
  }

  return (
    <ProfileSettingsModal
      isOpen
      onClose={() => router.push("/listings")}
      onSuccess={() => {}}
    />
  );
}
