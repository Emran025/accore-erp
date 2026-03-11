"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { EmployeeAssets } from "./EmployeeAssets";

export default function EmployeeAssetsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout >
      <EmployeeAssets />
    </MainLayout>
  );
}

