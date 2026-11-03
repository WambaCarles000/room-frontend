import { Suspense } from "react";
import RoomLoader from "@/components/RoomLoader";
import AccountSuspendedPage from "./AccountSuspendedPage";

export default function SuspendedPage() {
  return (
    <Suspense fallback={(
      <div className="flex min-h-screen items-center justify-center">
        <RoomLoader size="lg" />
      </div>
    )}>
      <AccountSuspendedPage />
    </Suspense>
  );
}