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
            const res: any = await fetchAPI(catalogText(i18n, "text_0907f4dfb304", { value0: API_ENDPOINTS.HUMAN_CAPITAL.CONTRACTS.BASE, value1: id }));
            setContract(res.data || res);
        } catch (error) {
            showToast(i18n.catalog["text_7d2b9645b54d"], "error");
        } finally {
            setIsLoading(false);
        }
    };

    const getContractTypeLabel = (type: string) => {
        switch (type) {
            case 'full_time': return i18n.catalog["text_ae607c34c510"];
            case 'part_time': return i18n.catalog["text_68b482db7711"];
            case 'contract': return i18n.catalog["text_eef75f5b33a4"];
            case 'freelance': return i18n.catalog["text_7d6bc53d4745"];
            default: return type;
        }
    };

    return (
        <MainLayout >
            {isLoading ? (
                <div className="text-center p-8">{i18n.catalog["text_ceac78d7f5d3"]}</div>
            ) : contract ? (
                <div className="sales-card animate-fade">
                    <PageSubHeader
                        title={catalogText(i18n, "text_34805cca27a3", { value0: contract.contract_number })}
                        titleIcon="file-contract"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => router.back()}>
                                    {i18n.catalog["text_0dfcbc2d5f2a"]}</Button>
                                <Button variant="primary" onClick={() => router.push(`/06-human-capital/workforce-admin/employee-master/contracts/edit/${contract.id}`)} icon="edit">
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
                                        <span className="font-medium">{contract.employee?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_5f898546bf0e"]}</span>
                                        <span className="font-medium">{contract.employee?.employee_code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_6f93aa092068"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_406789d1f187"]}</span>
                                        <span className="badge badge-outline">{getContractTypeLabel(contract.contract_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_a8f120c07725"]}</span>
                                        <span className="font-bold text-primary">{formatCurrency(contract.base_salary)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_02e196bdec60"]}</span>
                                        <span className={`badge ${contract.is_current ? 'badge-success' : 'badge-secondary'}`}>
                                            {contract.is_current ? i18n.catalog["text_e7e4a3bf3fb7"] : i18n.catalog["text_6217883aee8e"]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_fd5069afa55f"]}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_0420ca4a0aa9"]}</span>
                                        <span>{formatDate(contract.contract_start_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_a47210894401"]}</span>
                                        <span>{contract.contract_end_date ? formatDate(contract.contract_end_date) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{i18n.catalog["text_9dd59433565f"]}</span>
                                        <span>{contract.probation_end_date ? formatDate(contract.probation_end_date) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {contract.notes && (
                            <div className="md:col-span-2">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-semibold text-lg mb-3 pb-2 border-b">{i18n.catalog["text_d446d2dc6b81"]}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">{i18n.catalog["text_ae0e8fff9210"]}</div>
            )}
        </MainLayout>
    );
}


export default function ViewContractPage() {
    const { t: i18n } = useI18n();
    return (
        <Suspense fallback={<div className="p-8 text-center">{i18n.catalog["text_ceac78d7f5d3"]}</div>}>
            <ViewContractPageContent />
        </Suspense>
    );
}
