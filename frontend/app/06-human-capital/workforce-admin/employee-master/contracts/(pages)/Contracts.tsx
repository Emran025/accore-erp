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
            console.error(i18n.catalog["text_2aa4050b1359"], error);
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

    const columns: Column<EmployeeContract>[] = [
        {
            key: "employee",
            header: i18n.catalog["text_b71a39c832a6"],
            dataLabel: i18n.catalog["text_b71a39c832a6"],
            render: (item) => (
                <div>
                    <div className="font-semibold">{item.employee?.full_name || '-'}</div>
                    <small className="text-muted">{item.employee?.employee_code || ''}</small>
                </div>
            )
        },
        {
            key: "contract_number",
            header: i18n.catalog["text_490c244f7546"],
            dataLabel: i18n.catalog["text_490c244f7546"],
            render: (item) => <code className="text-primary">{item.contract_number}</code>
        },
        {
            key: "contract_start_date",
            header: i18n.catalog["text_90f719b91522"],
            dataLabel: i18n.catalog["text_90f719b91522"],
            render: (item) => formatDate(item.contract_start_date)
        },
        {
            key: "contract_end_date",
            header: i18n.catalog["text_ec3093bd6fd5"],
            dataLabel: i18n.catalog["text_ec3093bd6fd5"],
            render: (item) => item.contract_end_date ? formatDate(item.contract_end_date) : i18n.catalog["text_5a0374f3ff5a"]
        },
        {
            key: "base_salary",
            header: i18n.catalog["text_73ad6b20ceb7"],
            dataLabel: i18n.catalog["text_73ad6b20ceb7"],
            render: (item) => formatCurrency(item.base_salary)
        },
        {
            key: "contract_type",
            header: i18n.catalog["text_2b9fa3db572a"],
            dataLabel: i18n.catalog["text_2b9fa3db572a"],
            render: (item) => (
                <span className="badge badge-outline">
                    {getContractTypeLabel(item.contract_type)}
                </span>
            )
        },
        {
            key: "is_current",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${item.is_current ? 'badge-success' : 'badge-secondary'}`}>
                    {item.is_current ? i18n.catalog["text_e7e4a3bf3fb7"] : i18n.catalog["text_8328def359a0"]}
                </span>
            )
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        {
                            icon: "eye",
                            title: i18n.catalog["text_4b615d0e6dd2"],
                            variant: "view",
                            onClick: () => router.push(`/06-human-capital/workforce-admin/employee-master/contracts/view/${item.id}`)
                        },
                        ...(canAccess("employees", "edit") ? [{
                            icon: "edit" as const,
                            title: i18n.catalog["text_113d570d6555"],
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
                title={i18n.catalog["text_97fe2c7ce722"]}
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
                        placeholder={i18n.catalog["text_5b0c6ee40285"]}
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
                            {i18n.catalog["text_434bdd711ace"]}</Button>
                    )
                }
            />

            <Table
                columns={columns}
                data={contracts}
                keyExtractor={(item) => item.id.toString()}
                emptyMessage={i18n.catalog["text_f80b6f6a58b0"]}
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
