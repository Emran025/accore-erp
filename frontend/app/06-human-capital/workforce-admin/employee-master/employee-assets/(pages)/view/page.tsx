"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { EmployeeAsset } from "@/types";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ViewAssetPageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [asset, setAsset] = useState<EmployeeAsset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            allocated: i18n.catalog["text_17c28aaaa777"],
            returned: i18n.catalog["text_75fbb16d08be"],
            maintenance: i18n.catalog["text_9c499d210797"],
            lost: i18n.catalog["text_b4e5ae7ca0e7"],
            damaged: i18n.catalog["text_c4c3267f2898"]
        };
        return labels[status] || status;
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            allocated: "badge-success",
            returned: "badge-secondary",
            maintenance: "badge-warning",
            lost: "badge-danger",
            damaged: "badge-danger"
        };
        return badges[status] || "badge-secondary";
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["text_ceac78d7f5d3"]}</div>
            ) : asset ? (
                <div className="sales-card animate-fade">
                    <PageSubHeader
                        title={catalogText(i18n, "text_1d804cbdf58b", { value0: asset.asset_name })}
                        titleIcon="laptop"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => router.back()}>
                                    {i18n.catalog["text_0dfcbc2d5f2a"]}</Button>
                                <Button variant="primary" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/employee-assets/edit/${asset.id}`)} icon="edit">
                                    {i18n.catalog["text_113d570d6555"]}</Button>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_53c7802b034c"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_b0ae3c0ca9a8"]}</span>
                                        <span className="font-medium">{asset.employee?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_5f898546bf0e"]}</span>
                                        <span className="font-medium">{asset.employee?.employee_code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_fa816ef9967f"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_68b33bca3d6d"]}</span>
                                        <span className="font-mono text-primary">{asset.asset_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_0e20d829bef2"]}</span>
                                        <span>{asset.asset_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_02e196bdec60"]}</span>
                                        <span className={`badge ${getStatusBadge(asset.status)}`}>
                                            {getStatusLabel(asset.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_2e2f13c55d5a"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_ef3fbc16d8ff"]}</span>
                                        <span>{formatDate(asset.allocation_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_1298b51313e6"]}</span>
                                        <span>{asset.return_date ? formatDate(asset.return_date) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_e48271ce266b"]}</span>
                                        <span>{asset.next_maintenance_date ? formatDate(asset.next_maintenance_date) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_e6f1d217a0e2"]}</span>
                                        <span className="font-mono">{asset.serial_number || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_497e2b3ad934"]}</span>
                                        <span className="font-mono">{asset.qr_code || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {asset.notes && (
                            <div className="md:col-span-2">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_d446d2dc6b81"]}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">{i18n.catalog["text_34c65baca332"]}</div>
            )}
        </MainLayout>
    );
}


export default function ViewAssetPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <ViewAssetPageContent />
        </Suspense>
    );
}
