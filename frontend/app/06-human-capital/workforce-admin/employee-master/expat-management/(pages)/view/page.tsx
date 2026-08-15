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
            const res: any = await fetchAPI(catalogText(i18n, "common.general.message", { value0: API_ENDPOINTS.HUMAN_CAPITAL.EXPAT_MANAGEMENT.BASE, value1: id }));
            setRecord(res.data || res);
        } catch (error) {
            showToast(i18n.catalog["common.general.failedLoadRecord.alternative2"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return { class: "bg-gray-100 text-gray-800", text: "-" };
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return { class: i18n.catalog["common.general.badgeBadgeDanger"], text: i18n.catalog["common.general.expired"] };
        if (daysUntilExpiry < 30) return { class: i18n.catalog["common.general.badgeBadgeWarning"], text: catalogText(i18n, "humanCapital.pages.comingSoonDay", { value0: daysUntilExpiry }) };
        if (daysUntilExpiry < 90) return { class: i18n.catalog["common.general.badgeBadgeInfo"], text: i18n.catalog["humanCapital.pages.within3Months"] };
        return { class: i18n.catalog["common.general.badgeBadgeSuccess"], text: i18n.catalog["common.general.valid.alternative3"] };
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["common.general.loading"]}</div>
            ) : record ? (
                <div className="sales-card animate-fade">
                    <PageSubHeader
                        title={catalogText(i18n, "humanCapital.pages.employeeRecord", { value0: record.employee?.full_name })}
                        titleIcon="globe"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => router.back()}>
                                    {i18n.catalog["common.general.back.alternative2"]}</Button>
                                <Button variant="primary" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/expat-management/edit/${record.id}`)} icon="edit">
                                    {i18n.catalog["common.general.edit"]}</Button>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["common.general.basicInformation"]}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.employee.alternative2"]}</span>
                                        <span className="font-medium">{record.employee?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.code.alternative2"]}</span>
                                        <span className="font-medium">{record.employee?.employee_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.hostCountry"]}</span>
                                        <span className="font-medium">{record.host_country}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.countryOrigin"]}</span>
                                        <span className="font-medium">{record.home_country || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.returnDate"]}</span>
                                        <span className="font-medium">{record.repatriation_date ? formatDate(record.repatriation_date) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["humanCapital.pages.monetaryAllowances"]}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.costLivingAdjustment"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.cost_of_living_adjustment || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.housingAllowance"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.housing_allowance || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.transitionPackage"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(record.relocation_package || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.taxFormula"]}</span>
                                        <span className={`badge ${record.tax_equalization ? 'badge-success' : 'badge-secondary'}`}>
                                            {record.tax_equalization ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["common.general.documentsResidencePermits"]}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["humanCapital.pages.passport"]}</div>
                                                <div className="font-mono">{record.passport_number || '-'}</div>
                                            </div>
                                            {record.passport_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["common.general.end.alternative2"]}{formatDate(record.passport_expiry)}</div>
                                                    <span className={getExpiryStatus(record.passport_expiry).class}>{getExpiryStatus(record.passport_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["humanCapital.pages.entryVisa"]}</div>
                                                <div className="font-mono">{record.visa_number || '-'}</div>
                                            </div>
                                            {record.visa_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["common.general.end.alternative2"]}{formatDate(record.visa_expiry)}</div>
                                                    <span className={getExpiryStatus(record.visa_expiry).class}>{getExpiryStatus(record.visa_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["humanCapital.pages.residence"]}</div>
                                                <div className="font-mono">{record.residency_number || '-'}</div>
                                            </div>
                                            {record.residency_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["common.general.end.alternative2"]}{formatDate(record.residency_expiry)}</div>
                                                    <span className={getExpiryStatus(record.residency_expiry).class}>{getExpiryStatus(record.residency_expiry).text}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-xs text-secondary">{i18n.catalog["humanCapital.pages.workPermit"]}</div>
                                                <div className="font-mono">{record.work_permit_number || '-'}</div>
                                            </div>
                                            {record.work_permit_expiry && (
                                                <div className="text-right">
                                                    <div className="text-xs text-secondary">{i18n.catalog["common.general.end.alternative2"]}{formatDate(record.work_permit_expiry)}</div>
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
                                    <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["common.general.notes.alternative2"]}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">{i18n.catalog["humanCapital.pages.sorryRequestedRecordWasNotFound"]}</div>
            )}
        </MainLayout>
    );
}


export default function ViewExpatPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["common.general.loading"]}</div>}>
            <ViewExpatPageContent />
        </Suspense>
    );
}
