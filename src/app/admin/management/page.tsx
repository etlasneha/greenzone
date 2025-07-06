"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminManagement from "../AdminManagement";

export default function AdminManagementPage() {
  const router = useRouter();
  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        router.replace("/auth/login");
        return;
      }
      const user = await res.json();
      if (!user || user.role !== "admin") {
        router.replace("/unauthorized");
      }
    }
    checkSession();
  }, [router]);

  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 sm:p-12 max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Admin Management</h1>
        <AdminManagement />
      </div>
    </main>
  );
}
