"use client";

import { MainLayout } from "@/components/layout";
import { Permission, User, getStoredPermissions, getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";

import { CurrencyListTab } from "../components/CurrencyListTab";

export default function CurrenciesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedPermissions = getStoredPermissions();
    setUser(storedUser);
    setPermissions(storedPermissions);
  }, []);

  return (
    <MainLayout requiredModule="currency">
      <div className="settings-wrapper animate-fade">
        <CurrencyListTab />
      </div>
    </MainLayout>
  );
}
