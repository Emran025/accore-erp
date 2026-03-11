"use client";

import { MainLayout } from "@/components/layout";
import { getStoredUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { AssetForm } from "../../components/AssetForm";

export default function AddAssetPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getStoredUser());
    }, []);

    return (
        <MainLayout >
            <AssetForm />
        </MainLayout>
    );
}
