"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Learning } from "./Learning";

export default function LearningPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <MainLayout >
      <Learning />
    </MainLayout>
  );
}


