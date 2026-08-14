<?php

namespace App\Domains\Commercial\SalesLifecycle\Models;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosTerminal extends Model
{
    protected $fillable = [
        'code',
        'name',
        'name_en',
        'org_node_uuid',
        'warehouse_id',
        'cost_center_id',
        'profit_center_id',
        'status',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function profitCenter(): BelongsTo
    {
        return $this->belongsTo(ProfitCenter::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
