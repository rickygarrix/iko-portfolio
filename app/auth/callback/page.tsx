import React, { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">ログイン処理中...</div>}>
      <CallbackClient />
    </Suspense>
  );
}