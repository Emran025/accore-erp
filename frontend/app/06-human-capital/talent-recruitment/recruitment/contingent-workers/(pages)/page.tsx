"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { ContingentWorkers } from "./ContingentWorkers";

export default function ContingentWorkersPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout >
      <ContingentWorkers />
    </MainLayout>
  );
}


