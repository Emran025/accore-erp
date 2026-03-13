<?php

use Illuminate\Support\Facades\Route;
use App\Domains\EnterpriseCore\IAM\Actions\{
    LoginAction, LogoutAction, CheckSessionAction, ListUsersAction, CreateUserAction,
    UpdateUserAction, DeleteUserAction, ChangePasswordAction, ListManagersAction,
    ListMySessionsAction, ListRolesAction, CreateRoleAction, DeleteRoleAction,
    ListSessionsAction, DestroySessionAction, ListPermissionTemplatesAction,
    CreatePermissionTemplateAction, UpdatePermissionTemplateAction, ApplyPermissionTemplateAction,
    ListUserRolesAction
};
use App\Domains\EnterpriseCore\Governance\Actions\{
    ListSettingsAction, UpdateSettingsAction, ListAuditLogsAction, ListAuditTrailAction,
    ListSystemTemplatesAction, CreateSystemTemplateAction, ShowSystemTemplateAction,
    UpdateSystemTemplateAction, DeleteSystemTemplateAction, RenderSystemTemplateAction,
    ShowSystemTemplateByKeyAction, ShowSystemTemplateByTypeAction, ListSystemTemplateHistoryAction,
    GetApprovedTemplateKeysAction, GetStoreSettingsAction, UpdateStoreSettingsAction,
    GetInvoiceSettingsAction, UpdateInvoiceSettingsAction, GetZatcaSettingsAction,
    UpdateZatcaSettingsAction, OnboardZatcaAction
};

use App\Domains\EnterpriseCore\OrgStructure\Actions\{
    ListMetaTypesAction, ListTopologyRulesAction, ListStructureNodesAction, ShowStructureNodeAction,
    CreateStructureNodeAction, UpdateStructureNodeAction, DeleteStructureNodeAction,
    ListStructureLinksAction, CreateStructureLinkAction, UpdateStructureLinkAction,
    DeleteStructureLinkAction, ResolveScopeContextAction, GetOrgStatisticsAction,
    RunIntegrityCheckAction, GetOrgChangeHistoryAction, BulkUpdateNodeStatusAction
};
use App\Domains\EnterpriseCore\OrgIntegration\Actions\{
    SyncCostCenterAction, SyncProfitCenterAction, SyncNodeToTableAction, OpenCenterAction,
    CloseCenterAction, SyncJobTitleAction, BulkSyncOrgAction, GetIntegrationStatusAction,
    GetIntegrationIssuesAction, BulkSyncJobTitlesAction, BulkSyncCostCentersAction,
    BulkSyncNodesToTablesAction, BulkSyncProfitCentersAction, GetJobTitleMappingAction
};
use App\Domains\EnterpriseCore\NumberRanges\Actions\{
    ListNrObjectsAction, ShowNrObjectAction, CreateNrObjectAction, UpdateNrObjectAction, DeleteNrObjectAction,
    ListNrGroupsAction, CreateNrGroupAction, UpdateNrGroupAction, DeleteNrGroupAction,
    ListNrIntervalsAction, CreateNrIntervalAction, UpdateNrIntervalAction, DeleteNrIntervalAction,
    ExpandNrIntervalAction, GetNextNumberAction, PreviewNextNumberAction, ShowNrObjectByTypeAction,
    ListNrAssignmentsAction, CreateNrAssignmentAction, DeleteNrAssignmentAction,
    GetNrSystemSummaryAction, GetNrFullnessReportAction, ListNrExpansionLogsAction
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 01-EnterpriseCore
|--------------------------------------------------------------------------
| Covers: IAM, Governance, Org Structure, Org Integration, Number Ranges
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2'], function () {

    // ── Authentication
    Route::post('/login', LoginAction::class)->middleware('throttle:api-auth')->name('v2.login');
    
    Route::group(['middleware' => 'api.auth'], function () {
        Route::post('/logout', LogoutAction::class)->name('v2.logout');
        Route::get('/check', CheckSessionAction::class)->name('v2.check');
    });

    // ── Protected Core Routes
    Route::group(['middleware' => ['api.auth', 'throttle:api']], function () {

        // ── IAM: Users
        Route::group(['prefix' => 'users'], function() {
            Route::group(['middleware' => 'can:users,view'], function() {
                Route::get('/', ListUsersAction::class)->name('v2.users.index');
                Route::get('/managers', ListManagersAction::class)->name('v2.users.managers');
            });
            Route::middleware(['can:users,create', 'throttle:api-write'])->post('/', CreateUserAction::class)->name('v2.users.store');
            Route::middleware(['can:users,edit', 'throttle:api-write'])->put('/', UpdateUserAction::class)->name('v2.users.update');
            Route::middleware(['can:users,delete', 'throttle:api-delete'])->delete('/', DeleteUserAction::class)->name('v2.users.destroy');
        });

        Route::post('/change_password', ChangePasswordAction::class)->middleware('throttle:api-sensitive')->name('v2.change_password');
        Route::get('/my_sessions', ListMySessionsAction::class)->name('v2.my_sessions');
        Route::get('/user-roles', function () {
            return response()->json(['success' => true, 'data' => (new ListUserRolesAction())->execute()]);
        })->name('v2.user_roles.index');

        // ── IAM: Roles
        Route::group(['prefix' => 'roles', 'middleware' => 'can:settings,view'], function() {
            Route::get('/', ListRolesAction::class)->name('v2.roles.index');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/', CreateRoleAction::class)->name('v2.roles.store');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
                return app()->make(DeleteRoleAction::class, ['id' => (int) $id])();
            })->name('v2.roles.destroy');
        });

        // ── IAM: Permission Templates
        Route::group(['prefix' => 'permission-templates', 'middleware' => 'can:employees,view'], function() {
            Route::get('/', ListPermissionTemplatesAction::class)->name('v2.permission_templates.index');
            Route::middleware(['can:employees,create', 'throttle:api-write'])->post('/', CreatePermissionTemplateAction::class)->name('v2.permission_templates.store');
            Route::middleware(['can:employees,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdatePermissionTemplateAction::class, ['request' => $request, 'id' => (int) $id])();
            })->name('v2.permission_templates.update');
            Route::middleware(['can:employees,edit', 'throttle:api-sensitive'])->post('/apply', ApplyPermissionTemplateAction::class)->name('v2.permission_templates.apply');
        });

        // ── IAM: Sessions
        Route::group(['prefix' => 'sessions', 'middleware' => 'can:users,view'], function() {
            Route::get('/', ListSessionsAction::class)->name('v2.sessions.index');
            Route::middleware(['can:users,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
                return app()->make(DestroySessionAction::class, ['id' => (int) $id])();
            })->name('v2.sessions.destroy');
        });

        // ── Governance: Settings
        Route::group(['prefix' => 'settings', 'middleware' => 'can:settings,view'], function() {
            Route::get('/', ListSettingsAction::class)->name('v2.settings.index');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->post('/', UpdateSettingsAction::class)->name('v2.settings.update');

            // Store Settings
            Route::get('/store', function () {
                return response()->json(['success' => true, 'settings' => (new GetStoreSettingsAction())->execute()]);
            })->name('v2.settings.store.show');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->post('/store', function (Illuminate\Http\Request $request) {
                (new UpdateStoreSettingsAction())->execute($request->all());
                return response()->json(['success' => true, 'message' => 'Store settings updated']);
            })->name('v2.settings.store.update');

            // Invoice Settings
            Route::get('/invoice', function () {
                return response()->json(['success' => true, 'settings' => (new GetInvoiceSettingsAction())->execute()]);
            })->name('v2.settings.invoice.show');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->post('/invoice', function (Illuminate\Http\Request $request) {
                (new UpdateInvoiceSettingsAction())->execute($request->all());
                return response()->json(['success' => true, 'message' => 'Invoice settings updated']);
            })->name('v2.settings.invoice.update');

            // ZATCA Settings
            Route::get('/zatca', function () {
                return response()->json(['success' => true, 'settings' => (new GetZatcaSettingsAction())->execute()]);
            })->name('v2.settings.zatca.show');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->post('/zatca', function (Illuminate\Http\Request $request) {
                (new UpdateZatcaSettingsAction())->execute($request->all());
                return response()->json(['success' => true, 'message' => 'ZATCA settings updated']);
            })->name('v2.settings.zatca.update');
            Route::middleware(['can:settings,edit', 'throttle:api-critical'])->post('/zatca/onboard', function (Illuminate\Http\Request $request) {
                $action = app()->make(OnboardZatcaAction::class);
                $result = $action->execute($request->input('otp'), $request->input('csr_data', []));
                return response()->json($result);
            })->name('v2.settings.zatca.onboard');
        });

        // ── Governance: Audit
        Route::group(['middleware' => 'can:audit_trail,view'], function() {
            Route::get('/audit-logs', ListAuditLogsAction::class)->name('v2.audit_logs.index');
            Route::get('/audit-trail', ListAuditTrailAction::class)->name('v2.audit_trail.index');
        });

        // ── Governance: Templates
        Route::group(['prefix' => 'system-templates', 'middleware' => 'can:settings,view'], function() {
            Route::get('/', ListSystemTemplatesAction::class)->name('v2.templates.index');
            Route::get('/approved-keys', GetApprovedTemplateKeysAction::class)->name('v2.templates.approved_keys');
            Route::get('/key/{key}', function ($key) { return app()->make(ShowSystemTemplateByKeyAction::class, ['key' => $key])(); })->name('v2.templates.show_by_key');
            Route::get('/type/{type}', function ($type) { return app()->make(ShowSystemTemplateByTypeAction::class, ['type' => $type])(); })->name('v2.templates.show_by_type');
            Route::get('/{id}', function ($id) { return app()->make(ShowSystemTemplateAction::class, ['id' => (int)$id])(); })->name('v2.templates.show');
            Route::get('/{id}/history', function ($id) { return app()->make(ListSystemTemplateHistoryAction::class, ['id' => (int)$id])(); })->name('v2.templates.history');
            
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/', CreateSystemTemplateAction::class)->name('v2.templates.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateSystemTemplateAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.templates.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
                return app()->make(DeleteSystemTemplateAction::class, ['id' => (int)$id])();
            })->name('v2.templates.destroy');
            Route::post('/render', RenderSystemTemplateAction::class)->name('v2.templates.render');
        });

        // ── Org Structure
        Route::group(['prefix' => 'org', 'middleware' => 'can:settings,view'], function () {
            Route::get('/meta-types', ListMetaTypesAction::class)->name('v2.org.meta_types');
            Route::get('/topology-rules', ListTopologyRulesAction::class)->name('v2.org.topology_rules');
            Route::get('/nodes', ListStructureNodesAction::class)->name('v2.org.nodes');
            Route::get('/nodes/{uuid}', function ($uuid) { return app()->make(ShowStructureNodeAction::class, ['uuid' => $uuid])(); })->name('v2.org.nodes.show');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/nodes', CreateStructureNodeAction::class)->name('v2.org.nodes.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/nodes/{uuid}', function (Illuminate\Http\Request $request, $uuid) {
                return app()->make(UpdateStructureNodeAction::class, ['request' => $request, 'uuid' => $uuid])();
            })->name('v2.org.nodes.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/nodes/{uuid}', function ($uuid) {
                return app()->make(DeleteStructureNodeAction::class, ['uuid' => $uuid])();
            })->name('v2.org.nodes.destroy');

            Route::get('/links', ListStructureLinksAction::class)->name('v2.org.links');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/links', CreateStructureLinkAction::class)->name('v2.org.links.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/links/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateStructureLinkAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.org.links.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/links/{id}', function ($id) {
                return app()->make(DeleteStructureLinkAction::class, ['id' => (int)$id])();
            })->name('v2.org.links.destroy');

            Route::get('/scope-context/{uuid}', function ($uuid) { return app()->make(ResolveScopeContextAction::class, ['uuid' => $uuid])(); })->name('v2.org.scope_context');
            Route::get('/statistics', GetOrgStatisticsAction::class)->name('v2.org.statistics');
            Route::get('/integrity-check', RunIntegrityCheckAction::class)->name('v2.org.integrity_check');
            Route::get('/change-history', GetOrgChangeHistoryAction::class)->name('v2.org.change_history');
            Route::middleware(['can:settings,edit', 'throttle:api-critical'])->post('/bulk-status-update', BulkUpdateNodeStatusAction::class)->name('v2.org.bulk_status');
        });

        // ── Org Integration
        Route::group(['prefix' => 'org-integration', 'middleware' => 'can:settings,view'], function () {
            Route::post('/sync/cost-center/{uuid}', function ($uuid) { return app()->make(SyncCostCenterAction::class, ['id' => $uuid])(); })->name('v2.org_integration.sync_cost_center');
            Route::post('/sync/profit-center/{uuid}', function ($uuid) { return app()->make(SyncProfitCenterAction::class, ['id' => $uuid])(); })->name('v2.org_integration.sync_profit_center');
            Route::post('/sync/node/{uuid}', function ($uuid) { return app()->make(SyncNodeToTableAction::class, ['uuid' => $uuid])(); })->name('v2.org_integration.sync_node');
            Route::post('/sync/job-title/{id}', function ($id) { return app()->make(SyncJobTitleAction::class, ['id' => (int)$id])(); })->name('v2.org_integration.sync_job_title');
            Route::get('/job-titles/{id}/mapping', function ($id) { return app()->make(GetJobTitleMappingAction::class, ['id' => (int)$id])(); })->name('v2.org_integration.job_title_mapping');
            Route::post('/center/open', OpenCenterAction::class)->name('v2.org_integration.open_center');
            Route::post('/center/close', CloseCenterAction::class)->name('v2.org_integration.close_center');
            
            // Bulk Operations
            Route::post('/bulk-sync', BulkSyncOrgAction::class)->name('v2.org_integration.bulk_sync');
            Route::post('/bulk-sync/cost-centers', BulkSyncCostCentersAction::class)->name('v2.org_integration.bulk_sync_cost');
            Route::post('/bulk-sync/profit-centers', BulkSyncProfitCentersAction::class)->name('v2.org_integration.bulk_sync_profit');
            Route::post('/bulk-sync/nodes-to-tables', BulkSyncNodesToTablesAction::class)->name('v2.org_integration.bulk_sync_nodes');
            Route::post('/bulk-sync/job-titles', BulkSyncJobTitlesAction::class)->name('v2.org_integration.bulk_sync_titles');

            Route::get('/status', GetIntegrationStatusAction::class)->name('v2.org_integration.status');
            Route::get('/issues', GetIntegrationIssuesAction::class)->name('v2.org_integration.issues');
        });

        // ── Number Ranges
        Route::group(['prefix' => 'number-ranges', 'middleware' => 'can:settings,view'], function() {
            Route::get('/objects', ListNrObjectsAction::class)->name('v2.nr.objects.index');
            Route::get('/objects/summary', GetNrSystemSummaryAction::class)->name('v2.nr.summary');
            Route::get('/objects/type/{type}', function ($type) { return app()->make(ShowNrObjectByTypeAction::class, ['type' => $type])(); })->name('v2.nr.objects.show_by_type');
            Route::get('/objects/{id}', function ($id) { return app()->make(ShowNrObjectAction::class, ['id' => (int)$id])(); })->name('v2.nr.objects.show');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/objects', CreateNrObjectAction::class)->name('v2.nr.objects.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/objects/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateNrObjectAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.nr.objects.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/objects/{id}', function ($id) {
                return app()->make(DeleteNrObjectAction::class, ['id' => (int)$id])();
            })->name('v2.nr.objects.destroy');

            // Groups
            Route::get('/objects/{objectId}/groups', function ($objectId) { return app()->make(ListNrGroupsAction::class, ['objectId' => (int)$objectId])(); })->name('v2.nr.groups.index');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/objects/{objectId}/groups', function (Illuminate\Http\Request $request, $objectId) {
                return app()->make(CreateNrGroupAction::class, ['request' => $request, 'objectId' => (int)$objectId])();
            })->name('v2.nr.groups.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/groups/{groupId}', function (Illuminate\Http\Request $request, $groupId) {
                return app()->make(UpdateNrGroupAction::class, ['request' => $request, 'groupId' => (int)$groupId])();
            })->name('v2.nr.groups.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/groups/{groupId}', function ($groupId) {
                return app()->make(DeleteNrGroupAction::class, ['groupId' => (int)$groupId])();
            })->name('v2.nr.groups.destroy');

            // Intervals
            Route::get('/objects/{objectId}/intervals', function ($objectId) { return app()->make(ListNrIntervalsAction::class, ['objectId' => (int)$objectId])(); })->name('v2.nr.intervals.index');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/objects/{objectId}/intervals', function (Illuminate\Http\Request $request, $objectId) {
                return app()->make(CreateNrIntervalAction::class, ['request' => $request, 'objectId' => (int)$objectId])();
            })->name('v2.nr.intervals.store');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->put('/intervals/{intervalId}', function (Illuminate\Http\Request $request, $intervalId) {
                return app()->make(UpdateNrIntervalAction::class, ['request' => $request, 'intervalId' => (int)$intervalId])();
            })->name('v2.nr.intervals.update');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/intervals/{intervalId}', function ($intervalId) {
                return app()->make(DeleteNrIntervalAction::class, ['intervalId' => (int)$intervalId])();
            })->name('v2.nr.intervals.destroy');
            Route::middleware(['can:settings,edit', 'throttle:api-write'])->post('/intervals/{intervalId}/expand', function (Illuminate\Http\Request $request, $intervalId) {
                return app()->make(ExpandNrIntervalAction::class, ['request' => $request, 'intervalId' => (int)$intervalId])();
            })->name('v2.nr.intervals.expand');
            Route::get('/intervals/{intervalId}/expansion-logs', function ($intervalId) { return app()->make(ListNrExpansionLogsAction::class, ['intervalId' => (int)$intervalId])(); })->name('v2.nr.expansion_logs');

            // Assignments
            Route::get('/objects/{objectId}/assignments', function ($objectId) { return app()->make(ListNrAssignmentsAction::class, ['objectId' => (int)$objectId])(); })->name('v2.nr.assignments.index');
            Route::middleware(['can:settings,create', 'throttle:api-write'])->post('/objects/{objectId}/assignments', function (Illuminate\Http\Request $request, $objectId) {
                return app()->make(CreateNrAssignmentAction::class, ['request' => $request, 'objectId' => (int)$objectId])();
            })->name('v2.nr.assignments.store');
            Route::middleware(['can:settings,delete', 'throttle:api-delete'])->delete('/assignments/{assignmentId}', function ($assignmentId) {
                return app()->make(DeleteNrAssignmentAction::class, ['assignmentId' => (int)$assignmentId])();
            })->name('v2.nr.assignments.destroy');

            // Reports & Generation
            Route::get('/objects/{objectId}/fullness', function ($objectId) { return app()->make(GetNrFullnessReportAction::class, ['objectId' => (int)$objectId])(); })->name('v2.nr.fullness');
            Route::post('/get-next', GetNextNumberAction::class)->name('v2.nr.get_next');
            Route::post('/preview-number', PreviewNextNumberAction::class)->name('v2.nr.preview_next');
        });

    });
});
