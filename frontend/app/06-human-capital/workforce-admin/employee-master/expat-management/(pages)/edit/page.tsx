"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";

import { ExpatRecord } from "@/types";
import { MainLayout } from "@/components/layout";
import { showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Suspense, useEffect, useState } from "react";
import { ExpatForm } from "../../components/ExpatForm";

function EditExpatPageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [record, setRecord] = useState<ExpatRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setUser(getStoredUser());
        loadRecord();
    }, [id]);

    const loadRecord = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE, value1: id }));
            setRecord(res.data || res);
        } catch (error) {
            showToast(i18n.catalog["text_f8ab81e6fb34"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["text_ceac78d7f5d3"]}</div>
            ) : (
                record && <ExpatForm record={record} />
            )}
        </MainLayout>
    );
}


export default function EditExpatPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <EditExpatPageContent />
        </Suspense>
    );
}
