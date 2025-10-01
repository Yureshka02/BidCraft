import { Suspense } from "react";
import LoginForm from "./LoginForm";

// (optional) helps avoid static export quirks while developing
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
