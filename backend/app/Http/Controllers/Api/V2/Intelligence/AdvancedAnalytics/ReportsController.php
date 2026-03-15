<?php

namespace App\Http\Controllers\Api\V2\Intelligence\AdvancedAnalytics;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateAgingPayablesReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateAgingReceivablesReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateBalanceSheetReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateCashFlowReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateComparativeFinancialReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GenerateProfitLossReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GetAgingReportAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GetBalanceSheetAction;
use App\Domains\Intelligence\AdvancedAnalytics\Actions\GetProfitLossAction;

use App\Http\Requests\Intelligence\AdvancedAnalytics\GetBalanceSheetRequest;
use App\Http\Requests\Intelligence\AdvancedAnalytics\GetProfitLossRequest;
use App\Http\Requests\Intelligence\AdvancedAnalytics\GenerateCashFlowReportRequest;
use App\Http\Requests\Intelligence\AdvancedAnalytics\GetAgingReportRequest;
use App\Http\Requests\Intelligence\AdvancedAnalytics\GenerateComparativeFinancialReportRequest;

/**
 * Controller for generating Financial Reports via API.
 * Provides Balance Sheet, Profit & Loss, Cash Flow Statement,
 * Aging Reports for Receivables/Payables, and Comparative Analysis.
 */
class ReportsController extends Controller
{
    use BaseApiController;

    /**
     * Generate Balance Sheet report.
     */
    public function balanceSheet(GetBalanceSheetRequest $request, GetBalanceSheetAction $action): JsonResponse
    {
        PermissionService::requirePermission('reports', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Balance Sheet generated successfully');
    }

    /**
     * Generate Detailed Balance Sheet report.
     */
    public function balanceSheetDetailed(GetBalanceSheetRequest $request, GenerateBalanceSheetReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Detailed Balance Sheet generated successfully');
    }

    /**
     * Generate Profit & Loss (Income Statement) report.
     */
    public function profitLoss(GetProfitLossRequest $request, GetProfitLossAction $action): JsonResponse
    {
        PermissionService::requirePermission('reports', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Profit & Loss report generated successfully');
    }

    /**
     * Generate Detailed Profit & Loss report.
     */
    public function profitLossDetailed(GetProfitLossRequest $request, GenerateProfitLossReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Detailed Profit & Loss report generated successfully');
    }

    /**
     * Generate Cash Flow Statement.
     */
    public function cashFlow(GenerateCashFlowReportRequest $request, GenerateCashFlowReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result, 'Cash Flow statement generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 404);
        }
    }

    /**
     * Generate Aging Summary report.
     */
    public function aging(GetAgingReportRequest $request, GetAgingReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('reports', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Aging summary generated successfully');
    }

    /**
     * Generate Aging Receivables report.
     */
    public function agingReceivables(GetAgingReportRequest $request, GenerateAgingReceivablesReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Aging Receivables report generated successfully');
    }

    /**
     * Generate Aging Payables report.
     */
    public function agingPayables(GetAgingReportRequest $request, GenerateAgingPayablesReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Aging Payables report generated successfully');
    }

    /**
     * Generate Comparative Financial Report.
     */
    public function comparative(GenerateComparativeFinancialReportRequest $request, GenerateComparativeFinancialReportAction $action): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Comparative Financial Report generated successfully');
    }

}