"use client";

import { useI18n, catalogText } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
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
            const res: any = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_ASSETS.BASE, value1: id }));
            setAsset(res.data || res);
        } catch (error) {
            showToast(i18n.catalog["text_4ce3f7efcf25"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["text_ceac78d7f5d3"]}</div>
            ) : (
                asset && <AssetForm asset={asset} />
            )}
        </MainLayout>
    );
}


export default function EditAssetPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <EditAssetPageContent />
        </Suspense>
    );
}
