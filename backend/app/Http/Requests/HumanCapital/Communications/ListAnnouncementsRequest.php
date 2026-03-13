<?php

namespace App\Http\Requests\HumanCapital\Communications;

use Illuminate\Foundation\Http\FormRequest;

class ListAnnouncementsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'priority' => 'nullable|string',
            'is_published' => 'nullable|string|in:true,false,1,0',
            'all' => 'nullable|string|in:true,false,1,0',
        ];
    }
}
