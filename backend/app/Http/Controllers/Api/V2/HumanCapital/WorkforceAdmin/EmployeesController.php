<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListEmployeesRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreEmployeeRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateEmployeeRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreEmployeeDocumentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateEmployeeDocumentRequest;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;
use App\Http\Resources\HumanCapital\HRAdvanced\EmployeeDocumentResource;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\HRAdvanced\Models\EmployeeDocument;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Storage;
use Exception;

use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListEmployeesAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\SuspendEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ActivateEmployeeAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UploadEmployeeDocumentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListEmployeeDocumentsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateEmployeeDocumentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteEmployeeDocumentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DownloadEmployeeDocumentAction;

class EmployeesController extends Controller
{
    use BaseApiController;

    public function index(ListEmployeesRequest $request, ListEmployeesAction $action)
    {
        $employees = $action->execute($request->validated());
        return $this->paginatedResponse(
            EmployeeResource::collection($employees['data'] ?? $employees),
            $employees['total'] ?? count($employees['data'] ?? $employees),
            $employees['current_page'] ?? 1,
            $employees['per_page'] ?? 15
        );
    }

    public function store(StoreEmployeeRequest $request, CreateEmployeeAction $action)
    {
        try {
            $employee = $action->execute($request->validated());
            $model = Employee::find($employee['id'] ?? $employee);
            return $this->successResponse(new EmployeeResource($model), 'Employee created successfully', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowEmployeeAction $action)
    {
        $employee = $action->execute($id);
        $model = Employee::find($employee['id'] ?? $id);
        return $this->successResponse(new EmployeeResource($model));
    }

    public function update(UpdateEmployeeRequest $request, $id, UpdateEmployeeAction $action)
    {
        $validated = $request->validated();
        
        $employee = $action->execute($id, $validated);

        $model = Employee::find($employee['id'] ?? $id);
        return $this->successResponse(new EmployeeResource($model), 'Employee updated successfully');
    }

    public function destroy($id, DeleteEmployeeAction $action)
    {
        $action->execute($id);
        return $this->successResponse([], 'Employee deleted successfully');
    }

    public function suspend($id, SuspendEmployeeAction $action)
    {
        $employee = $action->execute($id);
        $model = Employee::find($employee['id'] ?? $id);
        return $this->successResponse(new EmployeeResource($model), 'Employee suspended successfully');
    }

    public function activate($id, ActivateEmployeeAction $action)
    {
        $employee = $action->execute($id);
        $model = Employee::find($employee['id'] ?? $id);
        return $this->successResponse(new EmployeeResource($model), 'Employee activated successfully');
    }

    public function uploadDocument(StoreEmployeeDocumentRequest $request, $id, UploadEmployeeDocumentAction $action)
    {
        $document = $action->execute($id, $request->validated(), $request->file('document'));
        $model = EmployeeDocument::find($document['id'] ?? $document);
        return $this->successResponse(new EmployeeDocumentResource($model), 'Document uploaded successfully', 201);
    }

    public function getDocuments($id, ListEmployeeDocumentsAction $action)
    {
        $documents = $action->execute($id);
        return $this->successResponse(EmployeeDocumentResource::collection($documents['data'] ?? $documents));
    }

    public function downloadDocument($employeeId, $documentId, DownloadEmployeeDocumentAction $action)
    {
        try {
            $fileInfo = $action->execute((int)$employeeId, (int)$documentId);
            return Storage::download($fileInfo['file_path'], $fileInfo['document_name']);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 404);
        }
    }

    public function updateDocument(UpdateEmployeeDocumentRequest $request, $employeeId, $documentId, UpdateEmployeeDocumentAction $action)
    {
        $document = $action->execute($employeeId, $documentId, $request->validated());
        $model = EmployeeDocument::find($document['id'] ?? $documentId);
        return $this->successResponse(new EmployeeDocumentResource($model), 'Document updated successfully');
    }

    public function destroyDocument($employeeId, $documentId, DeleteEmployeeDocumentAction $action)
    {
        $action->execute($employeeId, $documentId);
        return $this->successResponse([], 'Document deleted successfully');
    }
}
