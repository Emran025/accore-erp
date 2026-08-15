<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Localization\LocalizedValue;

class CategoryResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        $nameTranslations = LocalizedValue::translations($this->resource, 'name');
        $descriptionTranslations = LocalizedValue::translations($this->resource, 'description');

        return [
            'id'         => $this->id,
            'name'       => LocalizedValue::resolve($this->resource, 'name'),
            'name_ar'    => $nameTranslations['ar'],
            'name_en'    => $nameTranslations['en'],
            'name_translations' => $nameTranslations,
            'description' => LocalizedValue::resolve($this->resource, 'description'),
            'description_ar' => $descriptionTranslations['ar'],
            'description_en' => $descriptionTranslations['en'],
            'description_translations' => $descriptionTranslations,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
