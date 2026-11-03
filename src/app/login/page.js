import { Suspense } from "react";
import RoomLoader from "@/components/RoomLoader";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50"><RoomLoader size="md" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
