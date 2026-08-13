"use client";
import { useSearchParams } from "next/navigation";

import { EmployeeAsset } from "@/types";
import { MainLayout } from "@/components/layout";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Suspense, useEffect, useState } from "react";
import { AssetForm } from "../../components/AssetForm";

function EditAssetPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [asset, setAsset] = useState<EmployeeAsset | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setUser(getStoredUser());
        loadAsset();
    }, [id]);

    const loadAsset = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE}/${id}`);
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


export default function EditAssetPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
            <EditAssetPageContent />
        </Suspense>
    );
}
