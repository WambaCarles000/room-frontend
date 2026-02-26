import { Suspense } from "react";
import AccountSuspendedPage from "./AccountSuspendedPage";

export default function SuspendedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountSuspendedPage />
    </Suspense>
  );
}