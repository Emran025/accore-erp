<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperatingContext extends Model
{
    protected $fillable = [
        'user_id',
        'org_node_uuid',
        'warehouse_id',
        'pos_terminal_id',
        'cost_center_id',
        'profit_center_id',
        'status',
        'is_default',
        'readiness_json',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'readiness_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function posTerminal(): BelongsTo
    {
        return $this->belongsTo(PosTerminal::class);
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function profitCenter(): BelongsTo
    {
        return $this->belongsTo(ProfitCenter::class);
    }
}
