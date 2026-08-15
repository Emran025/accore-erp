<?php

namespace App\Domains\SupplyChain\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Support\Localization\LocalizedValue;

class Category extends Model
{
    use HasFactory;
    protected $fillable = [
        'catalog_code',
        'name',
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'created_by',
    ];

    public function localized(string $attribute, ?string $locale = null): ?string
    {
        return LocalizedValue::resolve($this, $attribute, $locale);
    }

    /** @return array<string, string|null> */
    public function translationsFor(string $attribute): array
    {
        return LocalizedValue::translations($this, $attribute);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
