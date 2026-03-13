<?php

namespace App\Http\Requests\HumanCapital\Communications;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCorporateAnnouncementRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'priority' => 'nullable|string',
            'is_published' => 'boolean',
            'target_audience' => 'nullable|array',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
        ];
    }
}
