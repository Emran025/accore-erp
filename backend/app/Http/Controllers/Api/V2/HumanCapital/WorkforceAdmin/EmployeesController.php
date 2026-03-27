<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListEmployeesRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreEmployeeRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateEmployeeRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreEmployeeDocumentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateEmployeeDocumentRequest;

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

use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;
use App\Http\Resources\HumanCapital\HRAdvanced\EmployeeDocumentResource;
use App\Domains\HumanCapital\HRAdvanced\Models\EmployeeDocument;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Storage;
use Exception;

class EmployeesController extends Controller
{
    use BaseApiController;

    public function index(ListEmployeesRequest $request, ListEmployeesAction $action)
    {
        $paginator = $action->execute($request->validated());
        return $this->successResponse(EmployeeResource::collection($paginator));
    }

    public function store(StoreEmployeeRequest $request, CreateEmployeeAction $action)
    {
        try {
            $employee = $action->execute($request->validated());
            return $this->successResponse(new EmployeeResource($employee), 'Employee created successfully', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowEmployeeAction $action)
    {
        $employee = $action->execute($id);
        return $this->successResponse(new EmployeeResource($employee));
    }

    public function update(UpdateEmployeeRequest $request, $id, UpdateEmployeeAction $action)
    {
        try {
            $employee = $action->execute($id, $request->validated());
            return $this->successResponse(new EmployeeResource($employee), 'Employee updated successfully');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy($id, DeleteEmployeeAction $action)
    {
        $action->execute($id);
        return $this->successResponse([], 'Employee deleted successfully');
    }

    public function suspend($id, SuspendEmployeeAction $action)
    {
        $employee = $action->execute($id);
        return $this->successResponse(new EmployeeResource($employee), 'Employee suspended successfully');
    }

    public function activate($id, ActivateEmployeeAction $action)
    {
        $employee = $action->execute($id);
        return $this->successResponse(new EmployeeResource($employee), 'Employee activated successfully');
    }

    public function uploadDocument(StoreEmployeeDocumentRequest $request, $id, UploadEmployeeDocumentAction $action)
    {
        $document = $action->execute($id, $request->validated(), $request->file('document'));
        return $this->successResponse(new EmployeeDocumentResource($document), 'Document uploaded successfully', 201);
    }

    public function getDocuments($id, ListEmployeeDocumentsAction $action)
    {
        $documents = $action->execute($id);
        return $this->successResponse(EmployeeDocumentResource::collection($documents));
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
        return $this->successResponse(new EmployeeDocumentResource($document), 'Document updated successfully');
    }

    public function destroyDocument($employeeId, $documentId, DeleteEmployeeDocumentAction $action)
    {
        $action->execute($employeeId, $documentId);
        return $this->successResponse([], 'Document deleted successfully');
    }
}
