<?php

namespace Database\Seeders;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use Illuminate\Database\Seeder;

class DocumentTemplateSeeder extends Seeder
{
    // =========================================================================
    // ─── HR TEMPLATE HELPERS ────────────────────────────────────────────────
    // =========================================================================

    private function hrCSS(string $accent = '#0B2447', string $accentLight = '#E8EDF4', string $accentDark = '#05101F'): string
    {
        return '<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;600;700&display=swap");
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Tajawal","Noto Naskh Arabic","Traditional Arabic",sans-serif;background:#f5f5f5}
.dw{font-family:"Tajawal","Noto Naskh Arabic","Traditional Arabic",sans-serif;max-width:210mm;margin:20px auto;padding:0;color:#1a1a1a;line-height:1.8;font-size:14px;direction:rtl;position:relative;background:#fff;box-shadow:0 0 20px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden}
.dw::before{content:"";position:absolute;top:0;right:0;left:0;height:8px;background:linear-gradient(90deg,' . $accentDark . ' 0%,' . $accent . ' 50%,' . $accentDark . ' 100%);z-index:1}
.dw::after{content:"سري وموثوق";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:96px;font-weight:700;color:rgba(0,0,0,.02);pointer-events:none;white-space:nowrap;letter-spacing:12px;z-index:0;opacity:0.3}
.dp{padding:45px 55px 35px;position:relative;z-index:1}
.dh{display:flex;justify-content:space-between;align-items:flex-start;padding:25px 0 22px;border-bottom:3px solid ' . $accent . ';margin-bottom:28px;background:linear-gradient(to left,' . $accentLight . ',transparent);padding:25px 20px 22px;border-radius:6px}
.dh-logo{width:90px;height:90px;border:3px solid ' . $accent . ';border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#666;background:' . $accentLight . ';font-weight:600;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.dh-info{text-align:center;flex:1;padding:0 25px}
.dh-info h2{font-size:16px;color:' . $accent . ';font-weight:700;margin-bottom:4px;letter-spacing:0.5px;text-transform:uppercase}
.dh-info p{font-size:11px;color:#666;margin:2px 0;font-weight:500}
.dh-ref{text-align:left;font-size:11px;color:#555;min-width:160px;background:#fff;padding:12px 15px;border-radius:6px;border:1px solid #e0e0e0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.dh-ref span{display:block;margin:4px 0;line-height:1.6}
.dh-ref strong{color:' . $accent . ';font-weight:600}
.dt{text-align:center;margin:28px 0 30px;position:relative}
.dt h1{font-size:26px;color:' . $accent . ';font-weight:700;margin:0 0 6px;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,0.05)}
.dt p{font-size:14px;color:#777;font-style:italic;margin:0;font-weight:500}
.dt .dt-line{width:120px;height:4px;background:linear-gradient(90deg,transparent,' . $accent . ',transparent);margin:12px auto 0;border-radius:2px}
.di{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:0 0 24px;border:2px solid #e5e5e5;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05)}
.di-row{display:flex;border-bottom:1px solid #eee;transition:background 0.2s}
.di-row:last-child{border-bottom:none}
.di-row:hover{background:#fafafa}
.di-label{background:linear-gradient(to left,' . $accentLight . ',#f8f9fa);padding:12px 16px;font-weight:600;font-size:13px;color:#333;width:42%;min-width:42%;border-left:2px solid ' . $accent . ';font-weight:700}
.di-value{padding:12px 16px;font-size:13px;color:#444;flex:1;font-weight:500}
.di-full{grid-column:1/-1}
table.dtb{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,0.05);border-radius:6px;overflow:hidden}
table.dtb th{background:linear-gradient(135deg,' . $accent . ',' . $accentDark . ');color:#fff;padding:12px 14px;font-weight:600;text-align:right;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.2)}
table.dtb th:first-child{border-right:none}
table.dtb td{padding:11px 14px;border:1px solid #e8e8e8;vertical-align:middle;background:#fff}
table.dtb tr:nth-child(even) td{background:#f9f9f9}
table.dtb tr:hover td{background:' . $accentLight . ';transition:background 0.2s}
.ds{margin:24px 0}
.ds h3{font-size:17px;color:' . $accent . ';font-weight:700;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid ' . $accent . '33;text-transform:uppercase;letter-spacing:0.5px}
.ds p,.ds li{font-size:14px;line-height:2.1;color:#333;text-align:justify}
.ds ol{padding-right:28px;margin:12px 0;counter-reset:item}
.ds ol li{margin:8px 0;position:relative;padding-right:8px}
.ds ol li::marker{font-weight:700;color:' . $accent . '}
.ds .note-box{background:linear-gradient(to left,' . $accentLight . ',#f0f4f8);border-right:5px solid ' . $accent . ';padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.05);font-weight:500}
.ds .warn-box{background:linear-gradient(to left,#FFF8E7,#FFFBF0);border-right:5px solid #D4A017;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.05);font-weight:500}
.ds .error-box{background:linear-gradient(to left,#FEF2F2,#FFF5F5);border-right:5px solid #DC2626;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.05);font-weight:500}
.ds .input-line{border-bottom:2px dotted #999;display:inline-block;min-width:220px;margin:0 6px;padding-bottom:2px;color:#333;font-weight:500}
.dsig{display:flex;justify-content:space-between;margin:55px 0 25px;gap:35px;page-break-inside:avoid;padding:20px 0;border-top:2px dashed #ddd}
.dsig-block{text-align:center;flex:1;position:relative}
.dsig-line{border-top:3px solid #333;padding-top:10px;margin-top:50px;position:relative}
.dsig-line::before{content:"";position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:60px;height:3px;background:' . $accent . '}
.dsig-name{font-weight:700;font-size:14px;color:#222;margin-bottom:4px;letter-spacing:0.3px}
.dsig-title{font-size:12px;color:#666;margin-top:4px;font-weight:500}
.dsig-date{font-size:11px;color:#999;margin-top:8px;font-style:italic}
.df{margin-top:35px;padding-top:16px;border-top:2px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#999;background:#fafafa;padding:16px 20px;border-radius:6px}
.df-qr{width:60px;height:60px;border:2px solid #ddd;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#ccc;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
.chk{display:inline-block;width:18px;height:18px;border:2.5px solid ' . $accent . ';border-radius:4px;vertical-align:middle;margin-left:8px;position:relative}
.chk.checked::after{content:"✓";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:' . $accent . ';font-weight:700;font-size:12px}
@media print{.dw{max-width:none;margin:0;box-shadow:none;border-radius:0}.dw::before{print-color-adjust:exact;-webkit-print-color-adjust:exact}table.dtb th{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{size:A4;margin:15mm 12mm}.dp{padding:35px 45px 25px}.dsig{page-break-inside:avoid}}
</style>';
    }

    private function hrHeader(): string
    {
        return '<div class="dh">
<div class="dh-logo">شعار<br>المؤسسة</div>
<div class="dh-info">
<h2>{{company_name}}</h2>
<p>المملكة العربية السعودية</p>
<p>Kingdom of Saudi Arabia</p>
</div>
<div class="dh-ref">
<span><strong>رقم المرجع:</strong></span>
<span>{{reference_number}}</span>
<span><strong>التاريخ:</strong></span>
<span>{{today_date}}</span>
</div>
</div>';
    }

    private function hrSigs(array $signers): string
    {
        $html = '<div class="dsig">';
        foreach ($signers as $s) {
            $html .= '<div class="dsig-block">
<div class="dsig-line">
<div class="dsig-name">' . $s['ar'] . '</div>
<div class="dsig-title">' . $s['en'] . '</div>
</div>
<div class="dsig-date">التاريخ: ___/___/______</div>
</div>';
        }
        return $html . '</div>';
    }

    private function hrFooter(): string
    {
        return '<div class="df">
<div>هذا المستند صادر إلكترونياً ولا يحتاج إلى توقيع يدوي ما لم يُذكر خلاف ذلك<br>Electronically generated document - No manual signature required unless otherwise stated</div>
<div class="df-qr">QR<br>Code</div>
</div>';
    }

    private function hrWrap(string $accent, string $accentLight, string $accentDark, string $content): string
    {
        return $this->hrCSS($accent, $accentLight, $accentDark) . '<div class="dw"><div class="dp">' . $content . '</div></div>';
    }

    // =========================================================================
    // ─── SYSTEM TEMPLATE HELPERS ───────────────────────────────────────────
    // =========================================================================

    private function systemCSS(string $accent = '#1E40AF', string $accentLight = '#EFF6FF', string $accentDark = '#1E3A8A'): string
    {
        return '<style>
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap");
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Cairo","Inter",sans-serif;background:#f5f5f5;direction:rtl}
.invoice-doc{font-family:"Cairo","Inter",sans-serif;max-width:210mm;margin:20px auto;padding:0;color:#1a1a1a;line-height:1.8;font-size:14px;direction:rtl;position:relative;background:#fff;box-shadow:0 0 20px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden}
.invoice-doc::before{content:"";position:absolute;top:0;right:0;left:0;height:6px;background:linear-gradient(90deg,' . $accentDark . ' 0%,' . $accent . ' 50%,' . $accentDark . ' 100%);z-index:1}
.invoice-header{display:flex;justify-content:space-between;align-items:flex-start;padding:30px 40px 25px;border-bottom:3px solid ' . $accent . ';margin-bottom:25px;background:linear-gradient(to left,' . $accentLight . ',transparent);border-radius:0 0 8px 8px}
.invoice-header-left{flex:1;text-align:right}
.invoice-header-right{text-align:left;min-width:200px}
.invoice-logo{width:80px;height:80px;border:3px solid ' . $accent . ';border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;background:' . $accentLight . ';font-weight:600;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-bottom:15px}
.invoice-company-name{font-size:20px;color:' . $accent . ';font-weight:700;margin-bottom:8px;letter-spacing:0.5px}
.invoice-company-details{font-size:12px;color:#666;line-height:1.8}
.invoice-doc-title{text-align:center;margin:30px 0 35px;position:relative}
.invoice-doc-title h1{font-size:28px;color:' . $accent . ';font-weight:700;margin:0 0 8px;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,0.05)}
.invoice-doc-title p{font-size:14px;color:#777;font-style:italic;margin:0}
.invoice-doc-title .title-line{width:150px;height:4px;background:linear-gradient(90deg,transparent,' . $accent . ',transparent);margin:15px auto 0;border-radius:2px}
.invoice-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:0 0 30px;border:2px solid #e5e5e5;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05)}
.invoice-info-row{display:flex;border-bottom:1px solid #eee}
.invoice-info-row:last-child{border-bottom:none}
.invoice-info-label{background:linear-gradient(to left,' . $accentLight . ',#f8f9fa);padding:14px 18px;font-weight:600;font-size:13px;color:#333;width:45%;min-width:45%;border-left:3px solid ' . $accent . ';font-weight:700}
.invoice-info-value{padding:14px 18px;font-size:13px;color:#444;flex:1;font-weight:500}
.invoice-table{width:100%;border-collapse:collapse;margin:25px 0;font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,0.05);border-radius:6px;overflow:hidden}
.invoice-table th{background:linear-gradient(135deg,' . $accent . ',' . $accentDark . ');color:#fff;padding:14px 16px;font-weight:600;text-align:right;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.2)}
.invoice-table th:first-child{border-right:none}
.invoice-table td{padding:12px 16px;border:1px solid #e8e8e8;vertical-align:middle;background:#fff}
.invoice-table tr:nth-child(even) td{background:#f9f9f9}
.invoice-table tr:hover td{background:' . $accentLight . ';transition:background 0.2s}
.invoice-totals{display:flex;justify-content:flex-end;margin:25px 0}
.invoice-totals-table{width:350px;border-collapse:collapse;font-size:14px}
.invoice-totals-table td{padding:10px 15px;border:1px solid #e0e0e0}
.invoice-totals-table td:first-child{background:' . $accentLight . ';font-weight:600;text-align:right;width:60%}
.invoice-totals-table td:last-child{background:#fff;text-align:left;font-weight:600;width:40%}
.invoice-totals-table .total-row td{background:' . $accent . ';color:#fff;font-size:16px;font-weight:700;border-color:' . $accentDark . '}
.invoice-footer{margin-top:40px;padding-top:20px;border-top:2px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#999;background:#fafafa;padding:20px 30px;border-radius:6px}
.invoice-footer-left{text-align:right}
.invoice-footer-right{text-align:left}
.invoice-notes{margin:25px 0;padding:18px 22px;background:linear-gradient(to left,' . $accentLight . ',#f0f4f8);border-right:5px solid ' . $accent . ';border-radius:0 8px 8px 0;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.05);font-weight:500;line-height:1.9}
.invoice-signatures{display:flex;justify-content:space-between;margin:50px 0 30px;gap:40px;page-break-inside:avoid;padding:25px 0;border-top:2px dashed #ddd}
.invoice-signature-block{text-align:center;flex:1;position:relative}
.invoice-signature-line{border-top:3px solid #333;padding-top:12px;margin-top:60px;position:relative}
.invoice-signature-line::before{content:"";position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:80px;height:3px;background:' . $accent . '}
.invoice-signature-name{font-weight:700;font-size:15px;color:#222;margin-bottom:6px;letter-spacing:0.3px}
.invoice-signature-title{font-size:12px;color:#666;margin-top:6px;font-weight:500}
@media print{.invoice-doc{max-width:none;margin:0;box-shadow:none;border-radius:0}.invoice-doc::before{print-color-adjust:exact;-webkit-print-color-adjust:exact}.invoice-table th{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{size:A4;margin:15mm 12mm}.invoice-signatures{page-break-inside:avoid}}
</style>';
    }

    private function systemHeader(): string
    {
        return '<div class="invoice-header">
<div class="invoice-header-left">
<div class="invoice-logo">شعار<br>المؤسسة<br>Company<br>Logo</div>
<div class="invoice-company-name">{{company_name}}</div>
<div class="invoice-company-details">
<div>{{company_address}}</div>
<div>الرقم الضريبي / Tax ID: {{company_tax_id}}</div>
</div>
</div>
<div class="invoice-header-right">
<div style="font-size:11px;color:#666;margin-bottom:8px">رقم المرجع / Reference</div>
<div style="font-size:13px;font-weight:600;color:#333;margin-bottom:15px">{{reference_number}}</div>
<div style="font-size:11px;color:#666;margin-bottom:8px">التاريخ / Date</div>
<div style="font-size:13px;font-weight:600;color:#333">{{today_date}}</div>
</div>
</div>';
    }

    private function systemSigs(array $signers): string
    {
        $html = '<div class="invoice-signatures">';
        foreach ($signers as $s) {
            $html .= '<div class="invoice-signature-block">
<div class="invoice-signature-line">
<div class="invoice-signature-name">' . $s['ar'] . '</div>
<div class="invoice-signature-title">' . $s['en'] . '</div>
</div>
</div>';
        }
        return $html . '</div>';
    }

    private function systemWrap(string $accent, string $accentLight, string $accentDark, string $content): string
    {
        return $this->systemCSS($accent, $accentLight, $accentDark) . '<div class="invoice-doc"><div style="padding:40px 50px 30px;position:relative;z-index:1">' . $content . '</div></div>';
    }

    public function run(): void
    {
        $templates = [
            // =================================================================
            // ─── HR DOCUMENTS ────────────────────────────────────────────────
            // =================================================================
            [
                'template_key' => 'contract_default',
                'template_name_ar' => 'عقد عمل (افتراضي)',
                'template_name_en' => 'Employment Contract (Default)',
                'template_type' => 'contract',
                'body_html' => $this->hrWrap('#0B2447', '#E8EDF4', '#05101F',
                    $this->hrHeader() .
                    '<div class="dt"><h1>عقد عمل</h1><p>Employment Contract</p><div class="dt-line"></div></div>
<div class="di">
<div class="di-row di-full"><div class="di-label">اسم الموظف / Employee Name</div><div class="di-value">{{employee_name}}</div></div>
<div class="di-row"><div class="di-label">الرقم الوظيفي / Employee Code</div><div class="di-value">{{employee_code}}</div></div>
<div class="di-row"><div class="di-label">رقم الهوية الوطنية / National ID</div><div class="di-value">{{employee_national_id}}</div></div>
<div class="di-row"><div class="di-label">القسم / Department</div><div class="di-value">{{department}}</div></div>
<div class="di-row"><div class="di-label">المسمى الوظيفي / Job Title</div><div class="di-value">{{role}}</div></div>
<div class="di-row"><div class="di-label">تاريخ التعيين / Hire Date</div><div class="di-value">{{hire_date}}</div></div>
<div class="di-row"><div class="di-label">نوع العقد / Contract Type</div><div class="di-value">{{contract_type}}</div></div>
<div class="di-row di-full"><div class="di-label">الراتب الأساسي / Base Salary</div><div class="di-value">{{base_salary}} ريال سعودي / Saudi Riyals</div></div>
<div class="di-row"><div class="di-label">البريد الإلكتروني / Email</div><div class="di-value">{{email}}</div></div>
<div class="di-row"><div class="di-label">رقم الجوال / Phone</div><div class="di-value">{{phone}}</div></div>
</div>
<div class="ds"><h3>البنود والشروط / Terms & Conditions</h3>
<ol>
<li>يلتزم الطرف الثاني (الموظف) بأداء المهام والمسؤوليات الموكلة إليه وفقاً للوصف الوظيفي المعتمد.</li>
<li>فترة التجربة ثلاثة (3) أشهر من تاريخ بدء العمل، وفقاً للمادة (53) من نظام العمل.</li>
<li>يخضع هذا العقد لأنظمة المملكة العربية السعودية.</li>
</ol>
<div class="note-box">✦ تم تحرير هذا العقد من نسختين أصليتين متطابقتين.</div>
</div>' .
                    $this->hrSigs([
                        ['ar' => 'توقيع الموظف / Employee', 'en' => 'Employee Signature'],
                        ['ar' => 'المدير المباشر / Manager', 'en' => 'Manager Signature'],
                    ]) .
                    $this->hrFooter()
                ),
                'editable_fields' => json_encode(['contract_type', 'reference_number', 'today_date']),
                'is_active' => true,
            ],
            [
                'template_key' => 'clearance_default',
                'template_name_ar' => 'نموذج إخلاء طرف (افتراضي)',
                'template_name_en' => 'Employee Clearance Form (Default)',
                'template_type' => 'clearance',
                'body_html' => $this->hrWrap('#7A1F1F', '#FBF0F0', '#4A1212',
                    $this->hrHeader() .
                    '<div class="dt"><h1>نموذج إخلاء طرف</h1><p>Employee Clearance Form</p><div class="dt-line"></div></div>
<div class="di">
<div class="di-row di-full"><div class="di-label">اسم الموظف / Employee Name</div><div class="di-value">{{employee_name}}</div></div>
<div class="di-row"><div class="di-label">الرقم الوظيفي / Employee Code</div><div class="di-value">{{employee_code}}</div></div>
<div class="di-row"><div class="di-label">تاريخ الإنهاء / Termination Date</div><div class="di-value">{{today_date}}</div></div>
</div>
<div class="ds"><h3>إخلاء الطرف من الأقسام / Department Clearance</h3>
<table class="dtb">
<tr><th style="width:5%">#</th><th>الجهة / Department</th><th style="width:15%">مخلص</th><th style="width:15%">غير مخلص</th><th style="width:15%">التوقيع</th></tr>
<tr><td style="text-align:center">1</td><td>الموارد البشرية / HR</td><td style="text-align:center"><span class="chk"></span></td><td style="text-align:center"><span class="chk"></span></td><td></td></tr>
<tr><td style="text-align:center">2</td><td>تقنية المعلومات / IT</td><td style="text-align:center"><span class="chk"></span></td><td style="text-align:center"><span class="chk"></span></td><td></td></tr>
<tr><td style="text-align:center">3</td><td>الشؤون المالية / Finance</td><td style="text-align:center"><span class="chk"></span></td><td style="text-align:center"><span class="chk"></span></td><td></td></tr>
</table>
</div>' .
                    $this->hrSigs([
                        ['ar' => 'الموظف / Employee', 'en' => 'Employee Signature'],
                        ['ar' => 'الموارد البشرية / HR', 'en' => 'HR Signature'],
                    ]) .
                    $this->hrFooter()
                ),
                'editable_fields' => json_encode(['reference_number', 'today_date']),
                'is_active' => true,
            ],
            [
                'template_key' => 'warning_default',
                'template_name_ar' => 'خطاب إنذار (افتراضي)',
                'template_name_en' => 'Warning Letter (Default)',
                'template_type' => 'warning',
                'body_html' => $this->hrWrap('#7D4E00', '#FFF8EB', '#4A2E00',
                    $this->hrHeader() .
                    '<div class="dt"><h1>خطاب إنذار رسمي</h1><p>Official Warning Letter</p><div class="dt-line"></div></div>
<div class="ds"><h3>تفاصيل المخالفة / Violation Details</h3>
<div class="warn-box">
<p><strong>وصف المخالفة:</strong></p>
<div style="min-height:80px;border:2px dashed #D4A017;border-radius:6px;padding:14px;margin-top:8px;background:#fff"></div>
</div>
</div>' .
                    $this->hrSigs([
                        ['ar' => 'الموظف / Employee', 'en' => 'Employee Signature'],
                        ['ar' => 'المدير / Manager', 'en' => 'Manager Signature'],
                    ]) .
                    $this->hrFooter()
                ),
                'editable_fields' => json_encode(['reference_number', 'today_date']),
                'is_active' => true,
            ],
            [
                'template_key' => 'id_card_default',
                'template_name_ar' => 'بطاقة هوية (افتراضي)',
                'template_name_en' => 'Employee ID Card (Default)',
                'template_type' => 'id_card',
                'body_html' => '<style>@import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap");*{margin:0;padding:0;box-sizing:border-box}body{font-family:Tajawal,sans-serif}</style>
<div style="width:380px;height:240px;background:linear-gradient(145deg,#0B2447 0%,#19376D 40%,#576CBC 100%);border-radius:16px;padding:24px 22px 18px;color:#fff;position:relative;overflow:hidden;direction:rtl;box-shadow:0 8px 32px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);margin:20px auto">
<div style="font-size:10px;text-align:center;letter-spacing:4px;opacity:0.85;margin-bottom:12px;text-transform:uppercase;font-weight:600">{{company_name}}</div>
<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
<div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:32px;border:3px solid rgba(212,175,55,0.6)">👤</div>
<div style="flex:1;min-width:0">
<div style="font-size:17px;font-weight:700">{{employee_name}}</div>
<div style="font-size:12px;opacity:0.9">{{role}}</div>
</div>
</div>
<div style="margin-top:16px;display:flex;justify-content:space-between;font-size:10px;border-top:2px solid rgba(255,255,255,0.2);padding-top:10px">
<div><span>رقم: </span><span style="font-weight:700">{{employee_code}}</span></div>
</div>
</div>',
                'editable_fields' => null,
                'is_active' => true,
            ],
            [
                'template_key' => 'certificate_default',
                'template_name_ar' => 'شهادة خبرة (افتراضي)',
                'template_name_en' => 'Experience Certificate (Default)',
                'template_type' => 'certificate',
                'body_html' => $this->hrWrap('#14532D', '#ECFDF5', '#0A2E1A',
                    $this->hrHeader() .
                    '<div class="dt"><h1>شهادة خبرة</h1><p>Experience Certificate</p><div class="dt-line"></div></div>
<div class="ds" style="text-align:center;margin:32px 0"><h3>إلى من يهمه الأمر / To Whom It May Concern</h3></div>
<p>نشهد بأن السيد/ة <strong>{{employee_name}}</strong> قد عمل/ت لدينا بنجاح.</p>' .
                    $this->hrSigs([['ar' => 'مدير الموارد البشرية', 'en' => 'HR Manager']]) .
                    $this->hrFooter()
                ),
                'editable_fields' => json_encode(['reference_number', 'today_date']),
                'is_active' => true,
            ],
            [
                'template_key' => 'handover_default',
                'template_name_ar' => 'نموذج تسليم (افتراضي)',
                'template_name_en' => 'Handover Form (Default)',
                'template_type' => 'handover',
                'body_html' => $this->hrWrap('#581C87', '#F5F3FF', '#3B1259',
                    $this->hrHeader() .
                    '<div class="dt"><h1>محضر تسليم واستلام</h1><p>Handover Report</p><div class="dt-line"></div></div>
<div class="di">
<div class="di-row"><div class="di-label">From / المُسلِّم</div><div class="di-value">{{employee_name}}</div></div>
</div>' .
                    $this->hrSigs([['ar' => 'المُسلِّم', 'en' => 'Outgoing'], ['ar' => 'المُستلِم', 'en' => 'Receiving']]) .
                    $this->hrFooter()
                ),
                'editable_fields' => null,
                'is_active' => true,
            ],
            [
                'template_key' => 'memo_default',
                'template_name_ar' => 'مذكرة (افتراضي)',
                'template_name_en' => 'Internal Memo (Default)',
                'template_type' => 'memo',
                'body_html' => $this->hrWrap('#334155', '#F1F5F9', '#1E293B',
                    $this->hrHeader() .
                    '<div class="dt"><h1>مذكرة داخلية</h1><p>Internal Memorandum</p><div class="dt-line"></div></div>
<div class="ds" style="min-height:200px;border:1px dashed #ddd;padding:20px">نص المذكرة...</div>' .
                    $this->hrSigs([['ar' => 'المُرسل', 'en' => 'Sender']]) .
                    $this->hrFooter()
                ),
                'editable_fields' => null,
                'is_active' => true,
            ],
            [
                'template_key' => 'other_default',
                'template_name_ar' => 'أخرى (افتراضي)',
                'template_name_en' => 'Other Document (Default)',
                'template_type' => 'other',
                'body_html' => $this->hrWrap('#5B21B6', '#F5F3FF', '#3C1A78',
                    $this->hrHeader() .
                    '<div class="dt"><h1>مستند رسمي</h1><p>Official Document</p><div class="dt-line"></div></div>
<div class="ds" style="min-height:300px;border:1px dashed #ddd;padding:30px">محتوى المستند...</div>' .
                    $this->hrFooter()
                ),
                'editable_fields' => null,
                'is_active' => true,
            ],

            // =================================================================
            // ─── SYSTEM/FINANCE DOCUMENTS ────────────────────────────────────
            // =================================================================
            [
                'template_key' => 'sales_invoice_default',
                'template_name_ar' => 'فاتورة مبيعات (افتراضي)',
                'template_name_en' => 'Sales Invoice (Default)',
                'template_type' => 'sales_invoice',
                'body_html' => $this->systemWrap('#1E40AF', '#EFF6FF', '#1E3A8A',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>فاتورة مبيعات / Sales Invoice</h1><div class="title-line"></div></div>
<table class="invoice-table">
<thead><tr><th>#</th><th>الوصف / Description</th><th>الكمية / Qty</th><th>السعر / Price</th><th>الإجمالي / Total</th></tr></thead>
<tbody><tr><td style="text-align:center">1</td><td>بند / Item</td><td style="text-align:center">1</td><td style="text-align:left">{{subtotal}}</td><td style="text-align:left">{{subtotal}}</td></tr></tbody>
</table>
<div class="invoice-totals"><table class="invoice-totals-table">
<tr class="total-row"><td>الإجمالي / Total</td><td>{{total_amount}} ريال</td></tr>
</table></div>' .
                    $this->systemSigs([['ar' => 'توقيع العميل', 'en' => 'Customer'], ['ar' => 'المحاسب', 'en' => 'Accountant']])
                ),
                'editable_fields' => json_encode(['invoice_number', 'invoice_date', 'customer_name', 'subtotal', 'total_amount']),
                'is_active' => true,
            ],
            [
                'template_key' => 'quotation_default',
                'template_name_ar' => 'عرض سعر (افتراضي)',
                'template_name_en' => 'Quotation (Default)',
                'template_type' => 'quotation',
                'body_html' => $this->systemWrap('#059669', '#ECFDF5', '#047857',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>عرض سعر / Quotation</h1></div>
<div style="min-height:200px">تفاصيل العرض...</div>' .
                    $this->systemSigs([['ar' => 'المبيعات', 'en' => 'Sales']])
                ),
                'editable_fields' => json_encode(['quotation_number', 'quotation_date', 'customer_name', 'total_amount']),
                'is_active' => true,
            ],
            [
                'template_key' => 'receipt_default',
                'template_name_ar' => 'سند قبض (افتراضي)',
                'template_name_en' => 'Receipt (Default)',
                'template_type' => 'receipt',
                'body_html' => $this->systemWrap('#10B981', '#ECFDF5', '#047857',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>سند قبض / Receipt</h1></div>
<div style="text-align:center;margin:40px 0;font-size:32px;font-weight:700">{{amount}} ريال</div>' .
                    $this->systemSigs([['ar' => 'أمين الصندوق', 'en' => 'Cashier']])
                ),
                'editable_fields' => json_encode(['amount', 'customer_name', 'description']),
                'is_active' => true,
            ],
            [
                'template_key' => 'purchase_order_default',
                'template_name_ar' => 'أمر شراء (افتراضي)',
                'template_name_en' => 'Purchase Order (Default)',
                'template_type' => 'purchase_order',
                'body_html' => $this->systemWrap('#F59E0B', '#FFFBEB', '#D97706',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>أمر شراء / Purchase Order</h1></div>' .
                    $this->systemSigs([['ar' => 'المشتريات', 'en' => 'Manager']])
                ),
                'editable_fields' => json_encode(['po_number', 'supplier_name']),
                'is_active' => true,
            ],
            [
                'template_key' => 'customer_statement_default',
                'template_name_ar' => 'كشف حساب (افتراضي)',
                'template_name_en' => 'Statement (Default)',
                'template_type' => 'customer_statement',
                'body_html' => $this->systemWrap('#7C3AED', '#F5F3FF', '#6D28D9',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>كشف حساب / Statement</h1></div>
<table class="invoice-table"><thead><tr><th>Date</th><th>Balance</th></tr></thead><tbody><tr><td>{{statement_date}}</td><td>{{closing_balance}}</td></tr></tbody></table>'
                ),
                'editable_fields' => json_encode(['customer_name', 'closing_balance']),
                'is_active' => true,
            ],
            [
                'template_key' => 'payment_note_default',
                'template_name_ar' => 'سند صرف (افتراضي)',
                'template_name_en' => 'Payment Note (Default)',
                'template_type' => 'payment_note',
                'body_html' => $this->systemWrap('#DC2626', '#FEF2F2', '#991B1B',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>سند صرف / Payment Note</h1></div>' .
                    $this->systemSigs([['ar' => 'المستلم', 'en' => 'Recipient']])
                ),
                'editable_fields' => json_encode(['amount', 'payee_name']),
                'is_active' => true,
            ],
            [
                'template_key' => 'other_system_default',
                'template_name_ar' => 'أخرى (افتراضي)',
                'template_name_en' => 'Other System (Default)',
                'template_type' => 'other_system',
                'body_html' => $this->systemWrap('#6B7280', '#F9FAFB', '#4B5563',
                    $this->systemHeader() .
                    '<div class="invoice-doc-title"><h1>مستند نظام</h1></div>'
                ),
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            DocumentTemplate::updateOrCreate(['template_key' => $template['template_key']], $template);
        }
    }
}
