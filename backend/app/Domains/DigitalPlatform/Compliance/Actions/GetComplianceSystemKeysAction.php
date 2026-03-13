<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

class GetComplianceSystemKeysAction
{
    public function execute(): array
    {
        return [
            'keys' => [
                // Invoice keys
                ['key' => 'invoice_number',      'label' => 'رقم الفاتورة',        'type' => 'string',  'group' => 'invoice'],
                ['key' => 'invoice_date',        'label' => 'تاريخ الفاتورة',      'type' => 'date',    'group' => 'invoice'],
                ['key' => 'invoice_type',        'label' => 'نوع الفاتورة',        'type' => 'string',  'group' => 'invoice'],
                ['key' => 'subtotal',            'label' => 'المجموع الفرعي',       'type' => 'number',  'group' => 'invoice'],
                ['key' => 'total_tax',           'label' => 'إجمالي الضريبة',      'type' => 'number',  'group' => 'invoice'],
                ['key' => 'grand_total',         'label' => 'الإجمالي النهائي',     'type' => 'number',  'group' => 'invoice'],
                ['key' => 'discount_amount',     'label' => 'مبلغ الخصم',          'type' => 'number',  'group' => 'invoice'],
                ['key' => 'currency_code',       'label' => 'رمز العملة',           'type' => 'string',  'group' => 'invoice'],
                // Tax-specific keys
                ['key' => 'tax_type_code',       'label' => 'رمز نوع الضريبة',     'type' => 'string',  'group' => 'tax'],
                ['key' => 'tax_rate',            'label' => 'نسبة الضريبة',        'type' => 'number',  'group' => 'tax'],
                ['key' => 'taxable_amount',      'label' => 'المبلغ الخاضع',       'type' => 'number',  'group' => 'tax'],
                ['key' => 'tax_amount',          'label' => 'مبلغ الضريبة',        'type' => 'number',  'group' => 'tax'],
                ['key' => 'tax_authority_code',  'label' => 'رمز الجهة الضريبية',  'type' => 'string',  'group' => 'tax'],
                // Seller keys
                ['key' => 'seller_name',         'label' => 'اسم البائع',          'type' => 'string',  'group' => 'seller'],
                ['key' => 'seller_vat_number',   'label' => 'الرقم الضريبي للبائع', 'type' => 'string',  'group' => 'seller'],
                ['key' => 'seller_cr_number',    'label' => 'السجل التجاري للبائع', 'type' => 'string',  'group' => 'seller'],
                ['key' => 'seller_address',      'label' => 'عنوان البائع',        'type' => 'string',  'group' => 'seller'],
                // Buyer keys
                ['key' => 'buyer_name',          'label' => 'اسم المشتري',         'type' => 'string',  'group' => 'buyer'],
                ['key' => 'buyer_vat_number',    'label' => 'الرقم الضريبي للمشتري','type' => 'string',  'group' => 'buyer'],
                ['key' => 'buyer_address',       'label' => 'عنوان المشتري',       'type' => 'string',  'group' => 'buyer'],
                // Line item keys
                ['key' => 'item_name',           'label' => 'اسم الصنف',           'type' => 'string',  'group' => 'line_item'],
                ['key' => 'item_quantity',       'label' => 'الكمية',              'type' => 'number',  'group' => 'line_item'],
                ['key' => 'item_unit_price',     'label' => 'سعر الوحدة',          'type' => 'number',  'group' => 'line_item'],
                ['key' => 'item_total',          'label' => 'إجمالي الصنف',        'type' => 'number',  'group' => 'line_item'],
                ['key' => 'item_tax_amount',     'label' => 'ضريبة الصنف',         'type' => 'number',  'group' => 'line_item'],
                // Payment keys
                ['key' => 'payment_method',      'label' => 'طريقة الدفع',         'type' => 'string',  'group' => 'payment'],
                ['key' => 'payment_date',        'label' => 'تاريخ الدفع',         'type' => 'date',    'group' => 'payment'],
                ['key' => 'payment_reference',   'label' => 'مرجع الدفع',          'type' => 'string',  'group' => 'payment'],
            ],
        ];
    }
}
