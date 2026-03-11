"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Benefits } from "./Benefits";

export default function BenefitsPage() {
  const [ setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout >
      <Benefits />
    </MainLayout>
  );
}


