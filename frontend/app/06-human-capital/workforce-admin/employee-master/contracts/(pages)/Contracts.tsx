"use client";

import { useI18n } from "@/lib/i18n";
import { EmployeeContract } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, SearchableSelect, Table } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Contracts() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const { canAccess } = useAuthStore();
    const [contracts, setContracts] = useState<EmployeeContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadContracts();
    }, [currentPage, searchTerm]);

    const loadContracts = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                search: searchTerm,
            });
            const res = await fetchAPI(`${API_ENDPOINTS.HUMAN_CAPITAL.CONTRACTS.BASE}?${query}`);
            setContracts(res.data as EmployeeContract[] || []);
            setTotalPages(Number(res.last_page) || 1);
        } catch (error) {
            console.error(i18n.catalog["humanCapital.contracts.failedLoadContracts"], error);
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

    const columns: Column<EmployeeContract>[] = [
        {
            key: "employee",
            header: i18n.catalog["common.general.employee.alternative3"],
            dataLabel: i18n.catalog["common.general.employee.alternative3"],
            render: (item) => (
                <div>
                    <div className="font-semibold">{item.employee?.full_name || '-'}</div>
                    <small className="text-muted">{item.employee?.employee_code || ''}</small>
                </div>
            )
        },
        {
            key: "contract_number",
            header: i18n.catalog["common.general.contractNumber"],
            dataLabel: i18n.catalog["common.general.contractNumber"],
            render: (item) => <code className="text-primary">{item.contract_number}</code>
        },
        {
            key: "contract_start_date",
            header: i18n.catalog["common.general.startDate.alternative2"],
            dataLabel: i18n.catalog["common.general.startDate.alternative2"],
            render: (item) => formatDate(item.contract_start_date)
        },
        {
            key: "contract_end_date",
            header: i18n.catalog["common.general.endDate.alternative2"],
            dataLabel: i18n.catalog["common.general.endDate.alternative2"],
            render: (item) => item.contract_end_date ? formatDate(item.contract_end_date) : i18n.catalog["common.general.unspecified"]
        },
        {
            key: "base_salary",
            header: i18n.catalog["common.general.basicSalary"],
            dataLabel: i18n.catalog["common.general.basicSalary"],
            render: (item) => formatCurrency(item.base_salary)
        },
        {
            key: "contract_type",
            header: i18n.catalog["common.general.contractType"],
            dataLabel: i18n.catalog["common.general.contractType"],
            render: (item) => (
                <span className="badge badge-outline">
                    {getContractTypeLabel(item.contract_type)}
                </span>
            )
        },
        {
            key: "is_current",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${item.is_current ? 'badge-success' : 'badge-secondary'}`}>
                    {item.is_current ? i18n.catalog["common.general.valid.alternative4"] : i18n.catalog["humanCapital.contracts.expiredPrevious"]}
                </span>
            )
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.viewDetails"],
                            variant: "view",
                            onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/contracts/view/${item.id}`)
                        },
                        ...(canAccess("employees", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit" as const,
                            onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/contracts/edit/${item.id}`)
                        }] : [])
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["common.general.contractsAgreements"]}
                titleIcon="file-contract"
                searchInput={
                    <SearchableSelect
                        options={[]}
                        value={null}
                        onChange={() => { }}
                        onSearch={(val) => {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }}
                        placeholder={i18n.catalog["humanCapital.contracts.searchContracts"]}
                        className="search-input"
                    />
                }
                actions={
                    canAccess("employees", "create") && (
                        <Button
                            onClick={() => router.push('/06-human-capital/workforce-admin/employee-master/contracts/add')}
                            variant="primary"
                            icon="plus"
                        >
                            {i18n.catalog["humanCapital.contracts.addContract"]}</Button>
                    )
                }
            />

            <Table
                columns={columns}
                data={contracts}
                keyExtractor={(item) => item.id.toString()}
                emptyMessage={i18n.catalog["humanCapital.contracts.noContractsRegistered"]}
                isLoading={isLoading}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: setCurrentPage,
                }}
            />
        </div>
    );
}
