"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser, User } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Benefits } from "./Benefits";

export default function BenefitsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout>
      <Benefits />
    </MainLayout>
  );
}
