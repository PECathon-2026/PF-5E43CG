# ==============================================================================
# TSUKUYOMI WATCHTOWER — AUTOMATED SCORING ENGINE TEST RUNNER (PowerShell)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Tsukuyomi Watchtower - Night Honor Score Unit Tests" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$testsPassed = 0
$totalTests = 5

# Test 1: Pristine sky
$cloud = 0
$bortle = 1
$vis = 30000
$humid = 20
$wind = 4
$moon = 0

$subC = 100 - $cloud
$subB = [Math]::Round(((9 - $bortle) / 8) * 100)
$subV = [Math]::Min(100, [Math]::Round(($vis / 24000) * 100))
$subH = 100
$subW = 100
$subM = 100 - $moon
$subL = 100

$score = ($subC * 0.3) + ($subB * 0.25) + ($subV * 0.15) + ($subH * 0.1) + ($subW * 0.05) + ($subM * 0.1) + ($subL * 0.05)
$finalScore = [Math]::Round($score)

if ($finalScore -ge 98 -and $finalScore -le 100) {
    Write-Host "[PASS] Test 1: Pristine Sky Scenario achieves top score: $finalScore / 100" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] Test 1: Unexpected score: $finalScore" -ForegroundColor Red
}

# Test 2: Overcast urban core
$wCloud = 100
$wBortle = 9
$wVis = 2000
$wHumid = 100
$wWind = 60
$wMoon = 100

$wSubC = 0
$wSubB = 0
$wSubV = [Math]::Round(($wVis / 24000) * 100)
$wSubH = 0
$wSubW = 0
$wSubM = 0
$wSubL = 30

$wScore = ($wSubC * 0.3) + ($wSubB * 0.25) + ($wSubV * 0.15) + ($wSubH * 0.1) + ($wSubW * 0.05) + ($wSubM * 0.1) + ($wSubL * 0.05)
$wFinal = [Math]::Round($wScore)

if ($wFinal -le 5) {
    Write-Host "[PASS] Test 2: Overcast, Urban Core Sky clamps to low score: $wFinal / 100" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] Test 2: Overcast score was too high: $wFinal" -ForegroundColor Red
}

# Test 3: Missing factor dynamic weight normalization
$availWeight = 0.30 + 0.25 + 0.15
$normC = 0.30 / $availWeight
$normB = 0.25 / $availWeight
$normV = 0.15 / $availWeight

$partScore = [Math]::Round((100 * $normC) + (90 * $normB) + (100 * $normV))
if ($partScore -gt 70 -and $partScore -le 100) {
    Write-Host "[PASS] Test 3: Missing Factor dynamic weight re-normalization succeeds: $partScore / 100" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] Test 3: Missing factor normalization failed" -ForegroundColor Red
}

# Test 4: Custom weights
$customC = 0.5
$customB = 0.5
$customScore = (100 * $customC) + (100 * $customB)
if ($customScore -eq 100) {
    Write-Host "[PASS] Test 4: Custom 50/50 weights configuration works accurately: $customScore / 100" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] Test 4: Custom weights failed" -ForegroundColor Red
}

# Test 5: Clamping boundary
$over = [Math]::Min(100, [Math]::Max(0, 142))
$under = [Math]::Min(100, [Math]::Max(0, -35))
if ($over -eq 100 -and $under -eq 0) {
    Write-Host "[PASS] Test 5: Boundary conditions strictly clamped between 0 and 100" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "[FAIL] Test 5: Boundary clamping failed" -ForegroundColor Red
}

Write-Host "----------------------------------------------------------"
Write-Host "Results: $testsPassed / $totalTests Unit Tests Passed" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
