"use client";

import { EmployeeAsset } from "@/types";
import { MainLayout } from "@/components/layout";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useEffect, useState } from "react";
import { AssetForm } from "../../../components/AssetForm";

export default function EditAssetPage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<any>(null);
    const [asset, setAsset] = useState<EmployeeAsset | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setUser(getStoredUser());
        loadAsset();
    }, [params.id]);

    const loadAsset = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchAPI(`${API_ENDPOINTS.HR.EMPLOYEE_ASSETS.BASE}/${params.id}`);
            setAsset(res.data || res);
        } catch (error) {
            showToast("فشل تحميل بيانات الأصل", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">جاري التحميل...</div>
            ) : (
                asset && <AssetForm asset={asset} />
            )}
        </MainLayout>
    );
}
