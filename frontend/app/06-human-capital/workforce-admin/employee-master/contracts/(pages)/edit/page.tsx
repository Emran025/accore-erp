"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";

import { EmployeeContract } from "@/types";
import { MainLayout } from "@/components/layout";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Suspense, useEffect, useState } from "react";
import { ContractForm } from "../../components/ContractForm";

function EditContractPageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [contract, setContract] = useState<EmployeeContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setUser(getStoredUser());
        loadContract();
    }, [id]);

    const loadContract = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.HUMAN_CAPITAL.CONTRACTS.BASE, value1: id }));
            setContract(res.data || res);
        } catch (error) {
            showToast(i18n.catalog["common.general.failedLoadContractData"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["common.general.loading"]}</div>
            ) : (
                contract && <ContractForm contract={contract} />
            )}
        </MainLayout>
    );
}


export default function EditContractPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["common.general.loading"]}</div>}>
            <EditContractPageContent />
        </Suspense>
    );
}
