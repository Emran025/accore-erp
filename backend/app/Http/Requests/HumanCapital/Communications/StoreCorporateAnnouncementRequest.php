<?php

namespace App\Http\Requests\HumanCapital\Communications;

use Illuminate\Foundation\Http\FormRequest;

class StoreCorporateAnnouncementRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'nullable|string',
            'is_published' => 'boolean',
            'target_audience' => 'nullable|array',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
        ];
    }
}
