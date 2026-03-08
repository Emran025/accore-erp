<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Api\BaseApiController;

class EmployeesController extends Controller
{
    use BaseApiController;

    public function index(Request $request)
    {
        $query = Employee::with(['role', 'department', 'position.jobTitle']);
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        
        return $this->successResponse($query->paginate(15)->toArray());

    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email|unique:users,username',
            'employee_code' => 'nullable|string|unique:employees,employee_code',
            'password' => 'required|min:6',
            'base_salary' => 'required|numeric|min:0',
            'hire_date' => 'required|date',
            'position_id' => 'required|exists:positions,id',
            'national_id' => 'nullable|string|max:20',
            'gosi_number' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:34',
            'bank_name' => 'nullable|string|max:100',
            'contract_type' => ['nullable', Rule::in(['full_time', 'part_time', 'contract', 'freelance'])],
            'vacation_days_balance' => 'nullable|numeric|min:0',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'employment_status' => 'nullable|in:active,suspended,terminated',
            'manager_id' => 'nullable|exists:employees,id',
            'nr_object_id' => 'nullable|integer',
            'nr_group_id'  => 'nullable|integer',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request) {
            // Resolve Manager User ID
            $managerUserId = null;
            if ($request->filled('manager_id')) {
                 $manager = Employee::find($request->manager_id);
                 $managerUserId = $manager ? $manager->user_id : null;
            }

            // Sync from Position
            $position = \App\Models\Position::findOrFail($request->position_id);
            $validated['job_title_id'] = $position->job_title_id;
            $validated['role_id'] = $position->role_id;
            $validated['department_id'] = $position->department_id;

            // Handle Auto Number Generation inside transaction
            if (empty($validated['employee_code']) && $request->filled('nr_object_id') && $request->filled('nr_group_id')) {
                $nrService = app(\App\Services\NumberRangeService::class);
                $validated['employee_code'] = $nrService->getNextNumber($request->nr_object_id, $request->nr_group_id);
            }

            // Still check code is present
            if (empty($validated['employee_code'])) {
                return response()->json(['success' => false, 'message' => 'الرقم الوظيفي مطلوب'], 422);
            }

            // Create User for Login
            $user = \App\Models\User::create([
                'username' => $validated['email'],
                'password' => Hash::make($request->password),
                'full_name' => $validated['full_name'],
                'role_id' => $position->role_id,
                'is_active' => ($validated['employment_status'] ?? 'active') === 'active',
                'manager_id' => $managerUserId,
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['created_by'] = auth()->id();
            $validated['user_id'] = $user->id;

            $employee = Employee::create($validated);
            return response()->json(array_merge(['success' => true], $employee->toArray()), 201);
        });
    }


    public function show($id)
    {
        return Employee::with(['role', 'department', 'position.jobTitle', 'documents', 'allowances', 'deductions', 'jobTitle'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        
        $validated = $request->validate([
            'full_name' => 'string|max:100',
            'email' => ['email', Rule::unique('employees')->ignore($id), Rule::unique('users', 'username')->ignore($employee->user_id)],
            'employee_code' => ['string', Rule::unique('employees')->ignore($id)],
            'base_salary' => 'numeric|min:0',
            'hire_date' => 'date',
            'position_id' => 'exists:positions,id',
            'national_id' => 'nullable|string|max:20',
            'gosi_number' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:34',
            'bank_name' => 'nullable|string|max:100',
            'contract_type' => ['nullable', Rule::in(['full_time', 'part_time', 'contract', 'freelance'])],
            'vacation_days_balance' => 'nullable|numeric|min:0',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'manager_id' => 'nullable|exists:employees,id',
            'employment_status' => 'nullable|in:active,suspended,terminated',
            'vacation_days_balance' => 'nullable|numeric|min:0',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $employee, $id) {
            $data = $request->except(['password']);
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            // Sync from Position if provided
            if ($request->filled('position_id')) {
                $position = \App\Models\Position::find($request->position_id);
                if ($position) {
                    $data['job_title_id'] = $position->job_title_id;
                    $data['role_id'] = $position->role_id;
                    $data['department_id'] = $position->department_id;
                }
            }

            $employee->update($data);

            // Sync User
            if ($employee->user_id) {
                $user = \App\Models\User::find($employee->user_id);
                if ($user) {
                    if ($request->filled('full_name')) $user->full_name = $request->full_name;
                    if ($request->filled('email')) $user->username = $request->email;
                    if (isset($data['role_id'])) $user->role_id = $data['role_id'];
                    if ($request->has('employment_status')) $user->is_active = $request->employment_status === 'active';
                    if ($request->filled('password')) $user->password = Hash::make($request->password);
                    
                    if ($request->has('manager_id')) {
                        if ($request->input('manager_id')) {
                            $manager = Employee::find($request->input('manager_id'));
                            $user->manager_id = $manager ? $manager->user_id : null;
                        } else {
                            $user->manager_id = null;
                        }
                    }

                    $user->save();
                }
            }

            return $this->successResponse($employee->toArray(), 'Employee updated successfully');
        });
    }

    public function destroy($id)
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
            $employee = Employee::findOrFail($id);
            if ($employee->user_id) {
                \App\Models\User::where('id', $employee->user_id)->delete();
            }
            $employee->delete();
            return response()->json(['success' => true]);
        });
    }

    public function suspend($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['employment_status' => 'suspended']);
        return response()->json($employee);
    }

    public function activate($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['employment_status' => 'active']);
        return response()->json($employee);
    }

    public function uploadDocument(Request $request, $id)
    {
        $request->validate([
            'document' => 'required|file|max:10240', // 10MB max
            'document_type' => 'required|string',
            'document_name' => 'required|string',
            'document_number' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiration_date' => 'nullable|date'
        ]);

        $employee = Employee::findOrFail($id);
        $file = $request->file('document');
        $path = $file->store("employees/{$id}/documents");

        $document = $employee->documents()->create([
            'document_type' => $request->document_type,
            'document_name' => $request->document_name,
            'document_number' => $request->document_number,
            'issue_date' => $request->issue_date,
            'expiration_date' => $request->expiration_date,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => auth()->id()
        ]);

        return response()->json($document, 201);
    }

    public function getDocuments($id)
    {
        $employee = Employee::findOrFail($id);
        return response()->json($employee->documents);
    }

    public function downloadDocument($employeeId, $documentId)
    {
        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        if (!\Illuminate\Support\Facades\Storage::exists($document->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return \Illuminate\Support\Facades\Storage::download(
            $document->file_path,
            $document->document_name
        );
    }
    public function updateDocument(Request $request, $employeeId, $documentId)
    {
        $request->validate([
            'document_type' => 'required|string',
            'document_name' => 'required|string',
            'document_number' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiration_date' => 'nullable|date'
        ]);

        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        $document->update([
            'document_type' => $request->document_type,
            'document_name' => $request->document_name,
            'document_number' => $request->document_number,
            'issue_date' => $request->issue_date,
            'expiration_date' => $request->expiration_date,
        ]);

        return response()->json($document);
    }

    public function destroyDocument($employeeId, $documentId)
    {
        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        if (\Illuminate\Support\Facades\Storage::exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::delete($document->file_path);
        }

        $document->delete();

        return response()->json(['success' => true]);
    }
}
