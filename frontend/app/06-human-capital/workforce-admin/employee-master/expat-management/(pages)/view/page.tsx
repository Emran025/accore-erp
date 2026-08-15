"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { ExpatRecord } from "@/types";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ViewExpatPageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [record, setRecord] = useState<ExpatRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return { class: i18n.catalog["text_f084b324d27d"], text: "-" };
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return { class: i18n.catalog["text_662a2d1d0a2d"], text: i18n.catalog["text_6217883aee8e"] };
        if (daysUntilExpiry < 30) return { class: i18n.catalog["text_35cf88831e8b"], text: catalogText(i18n, "text_eea7a54d5dfb", { value0: daysUntilExpiry }) };
        if (daysUntilExpiry < 90) return { class: i18n.catalog["text_99340b150df6"], text: i18n.catalog["text_0748afd211df"] };
        return { class: i18n.catalog["text_59e14762e315"], text: i18n.catalog["text_d106f86e1421"] };
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["text_ceac78d7f5d3"]}</div>
            ) : record ? (
                <div className="sales-card animate-fade">
                    <PageSubHeader
                        title={catalogText(i18n, "text_974910f9602e", { value0: record.employee?.full_name })}
                        titleIcon="globe"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => router.back()}>
                                    {i18n.catalog["text_0dfcbc2d5f2a"]}</Button>
                                <Button variant="primary" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/expat-management/edit/${record.id}`)} icon="edit">
                                    {i18n.catalog["text_113d570d6555"]}</Button>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_66a68be6dd8a"]}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_b6293eeef8b9"]}</span>
                                        <span className="font-medium">{record.employee?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_5f898546bf0e"]}</span>
                                        <span className="font-medium">{record.employee?.employee_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_41a8ccfd2a1e"]}</span>
                                        <span className="font-medium">{record.host_country}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_d076e98e243a"]}</span>
                                        <span className="font-medium">{record.home_country || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_5b3093a91c45"]}</span>
                                        <span className="font-medium">{record.repatriation_date ? formatDate(record.repatriation_date) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_94e4153dab05"]}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_bbd458f12304"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.cost_of_living_adjustment || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_78e2bdc9b20a"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.housing_allowance || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_464756ae3dc4"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.relocation_package || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_9264b0072da0"]}</span>
                                        <span className={`badge ${record.tax_equalization ? 'badge-success' : 'badge-secondary'}`}>
                                            {record.tax_equalization ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_eaa06e081543"]}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["text_7baba6b9e649"]}</div>
                                                <div className="font-mono">{record.passport_number || '-'}</div>
                                            </div>
                                            {record.passport_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["text_2017ca0dd13a"]}{formatDate(record.passport_expiry)}</div>
                                                    <span className={getExpiryStatus(record.passport_expiry).class}>{getExpiryStatus(record.passport_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["text_baac213e36a8"]}</div>
                                                <div className="font-mono">{record.visa_number || '-'}</div>
                                            </div>
                                            {record.visa_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["text_2017ca0dd13a"]}{formatDate(record.visa_expiry)}</div>
                                                    <span className={getExpiryStatus(record.visa_expiry).class}>{getExpiryStatus(record.visa_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["text_23fdbbb5f18e"]}</div>
                                                <div className="font-mono">{record.residency_number || '-'}</div>
                                            </div>
                                            {record.residency_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["text_2017ca0dd13a"]}{formatDate(record.residency_expiry)}</div>
                                                    <span className={getExpiryStatus(record.residency_expiry).class}>{getExpiryStatus(record.residency_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["text_cad84a9aa2e8"]}</div>
                                                <div className="font-mono">{record.work_permit_number || '-'}</div>
                                            </div>
                                            {record.work_permit_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["text_2017ca0dd13a"]}{formatDate(record.work_permit_expiry)}</div>
                                                    <span className={getExpiryStatus(record.work_permit_expiry).class}>{getExpiryStatus(record.work_permit_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {record.notes && (
                            <div className="md:col-span-2">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_d446d2dc6b81"]}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">{i18n.catalog["text_590f6a4268a2"]}</div>
            )}
        </MainLayout>
    );
}


export default function ViewExpatPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <ViewExpatPageContent />
        </Suspense>
    );
}
