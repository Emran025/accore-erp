"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { ExpatForm } from "../../components/ExpatForm";

export default function AddExpatPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    return (
        <MainLayout >
            <ExpatForm />
        </MainLayout>
    );
}
