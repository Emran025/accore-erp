
# Ensure UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$BasePath = Read-Host 'Enter full path'
if (-not (Test-Path $BasePath)) {
    Write-Host 'Path does not exist' -ForegroundColor Red
    exit
}

$OutFileName = Read-Host 'Enter output file name (without .txt)'
$OutFile = $OutFileName + '.txt'

# حفظ الملف بترميز UTF8 مع BOM
$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($OutFile, "Folder TREE (Depth = 2)`r`n", $utf8WithBom)
[System.IO.File]::AppendAllText($OutFile, "Path: $BasePath`r`n", $utf8WithBom)
[System.IO.File]::AppendAllText($OutFile, ('-' * 50) + "`r`n", $utf8WithBom)
[System.IO.File]::AppendAllText($OutFile, "`r`n", $utf8WithBom)

$level1 = Get-ChildItem $BasePath -Directory
$level1Count = $level1.Count
$l1Index = 0

foreach ($dir1 in $level1) {
    $l1Index++
    $isLastL1 = ($l1Index -eq $level1Count)

    $prefix1 = if ($isLastL1) { '└── ' } else { '├── ' }
    $continuation = if ($isLastL1) { '    ' } else { '│   ' }

    [System.IO.File]::AppendAllText($OutFile, "$prefix1$($dir1.Name)`r`n", $utf8WithBom)

    $level2 = Get-ChildItem $dir1.FullName -Directory
    $level2Count = $level2.Count
    $l2Index = 0

    foreach ($dir2 in $level2) {
        $l2Index++
        $isLastL2 = ($l2Index -eq $level2Count)

        $prefix2 = if ($isLastL2) { '└── ' } else { '├── ' }
        [System.IO.File]::AppendAllText($OutFile, "$continuation$prefix2$($dir2.Name)`r`n", $utf8WithBom)
    }
}

Write-Host "`nDONE!" -ForegroundColor Green
Write-Host "File saved as:" -NoNewline
Write-Host " $OutFile" -ForegroundColor Yellow
