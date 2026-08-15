"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { EmployeeContract } from "@/types";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { Button, showToast } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ViewContractPageContent() {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const id = searchParams.get("id") || "";
    const [user, setUser] = useState<any>(null);
    const [contract, setContract] = useState<EmployeeContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

    const getContractTypeLabel = (type: string) => {
        switch (type) {
            case 'full_time': return i18n.catalog["common.general.fullTime"];
            case 'part_time': return i18n.catalog["common.general.partTime"];
            case 'contract': return i18n.catalog["common.general.contract"];
            case 'freelance': return i18n.catalog["common.general.freelance"];
            default: return type;
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["common.general.loading"]}</div>
            ) : contract ? (
                <div className="sales-card animate-fade">
                    <PageSubHeader
                        title={catalogText(i18n, "humanCapital.pages.contract", { value0: contract.contract_number })}
                        titleIcon="file-contract"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => router.back()}>
                                    {i18n.catalog["common.general.back.alternative2"]}</Button>
                                <Button variant="primary" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/contracts/edit/${contract.id}`)} icon="edit">
                                    {i18n.catalog["common.general.edit"]}</Button>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["common.general.employeeInformation"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.name.alternative2"]}</span>
                                        <span className="font-medium">{contract.employee?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.code.alternative2"]}</span>
                                        <span className="font-medium">{contract.employee?.employee_code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["humanCapital.pages.contractTerms"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.contractType"]}</span>
                                        <span className="badge badge-outline">{getContractTypeLabel(contract.contract_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.basicSalary"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(contract.base_salary)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.status"]}</span>
                                        <span className={`badge ${contract.is_current ? 'badge-success' : 'badge-secondary'}`}>
                                            {contract.is_current ? i18n.catalog["common.general.valid.alternative4"] : i18n.catalog["common.general.expired"]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["humanCapital.pages.dates"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["common.general.startDate"]}</span>
                                        <span>{formatDate(contract.contract_start_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.endDate"]}</span>
                                        <span>{contract.contract_end_date ? formatDate(contract.contract_end_date) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["humanCapital.pages.endProbationPeriod"]}</span>
                                        <span>{contract.probation_end_date ? formatDate(contract.probation_end_date) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {contract.notes && (
                            <div className="md:col-span-2">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["common.general.notes.alternative2"]}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">{i18n.catalog["humanCapital.pages.sorryRequestedContractWasNotFound"]}</div>
            )}
        </MainLayout>
    );
}


export default function ViewContractPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["common.general.loading"]}</div>}>
            <ViewContractPageContent />
        </Suspense>
    );
}
