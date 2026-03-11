"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { EmployeeRelations } from "./EmployeeRelations";

export default function EmployeeRelationsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout >
      <EmployeeRelations />
    </MainLayout>
  );
}


