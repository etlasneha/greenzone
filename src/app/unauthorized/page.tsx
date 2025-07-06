import React from "react";

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-lg">You do not have permission to access this page.</p>
    </main>
  );
}
