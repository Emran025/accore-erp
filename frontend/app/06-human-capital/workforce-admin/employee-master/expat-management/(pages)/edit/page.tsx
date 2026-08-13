"use client";
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
            const res: any = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE}/${id}`);
            setRecord(res.data || res);
        } catch (error) {
            showToast("فشل تحميل السجل", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">جاري التحميل...</div>
            ) : (
                record && <ExpatForm record={record} />
            )}
        </MainLayout>
    );
}


export default function EditExpatPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
            <EditExpatPageContent />
        </Suspense>
    );
}
