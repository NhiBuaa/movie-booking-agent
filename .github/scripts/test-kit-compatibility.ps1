[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$KitScript
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$KitScript = (Resolve-Path -LiteralPath $KitScript).Path
$shellExecutable = (Get-Process -Id $PID).Path
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixtureRoot = Join-Path $tempBase ('movie-booking-kit-tests-' + [guid]::NewGuid().ToString('N'))
$feature = 'docs/05-specs/999-fixture'
$heading = '## Reviewer confirmation ' + [char]0x2014 + ' 2026-11-22'
$validFeature = @{
    "$feature/spec.md" = '# Spec'
    "$feature/plan.md" = '# Plan'
    "$feature/tasks.md" = '# Tasks'
}
$cases = @(
    @{ Name = 'gfm-spaces'; Links = $true; Marker = $false; Prohibited = 0; Broken = 0;
       Files = @{ 'README.md' = "[Review](review.md#reviewer-confirmation--2026-11-22)"; 'review.md' = $heading } },
    @{ Name = 'broken-anchor'; Links = $true; Marker = $false; Prohibited = 0; Broken = 1;
       Files = @{ 'README.md' = '[Review](review.md#missing)'; 'review.md' = $heading } },
    @{ Name = 'speckit-feature'; Links = $false; Marker = $true; Prohibited = 0; Broken = 0; Files = $validFeature },
    @{ Name = 'root-tracker'; Links = $false; Marker = $true; Prohibited = 1; Broken = 0;
       Files = @{ 'TASKS.md' = '# Work tracker' } },
    @{ Name = 'nested-tracker'; Links = $false; Marker = $true; Prohibited = 1; Broken = 0;
       Files = @{ 'docs/tasks.md' = '# Work tracker' } },
    @{ Name = 'missing-plan'; Links = $false; Marker = $true; Prohibited = 1; Broken = 0;
       Files = @{ "$feature/spec.md" = '# Spec'; "$feature/tasks.md" = '# Tasks' } },
    @{ Name = 'missing-constitution'; Links = $false; Marker = $false; Prohibited = 1; Broken = 0; Files = $validFeature },
    @{ Name = 'other-forbidden-file'; Links = $false; Marker = $true; Prohibited = 1; Broken = 0;
       Files = @{ "$feature/spec.md" = '# Spec'; "$feature/plan.md" = '# Plan'; "$feature/TODO.md" = '# Tracker' } }
)

try {
    foreach ($case in $cases) {
        $fixture = Join-Path $fixtureRoot $case.Name
        [void][IO.Directory]::CreateDirectory($fixture)
        $files = @{ 'README.md' = '# Fixture' }
        foreach ($entry in $case.Files.GetEnumerator()) { $files[$entry.Key] = $entry.Value }
        if ($case.Marker) { $files['.specify/memory/constitution.md'] = '# Constitution' }
        foreach ($entry in $files.GetEnumerator()) {
            $path = Join-Path $fixture $entry.Key
            [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($path))
            [IO.File]::WriteAllText($path, $entry.Value, [Text.UTF8Encoding]::new($false))
        }
        $arguments = @('-NoProfile', '-File', $KitScript, '-TargetPath', $fixture, '-Json')
        if ($case.Links) { $arguments += '-LinksOnly' }
        $output = & $shellExecutable @arguments | Out-String
        $report = $output | ConvertFrom-Json
        $prohibited = @($report.Errors | Where-Object { $_ -like '*Prohibited work-state tracking file*' })
        if ($prohibited.Count -ne $case.Prohibited -or $report.PassStats.BrokenLinks -ne $case.Broken) {
            throw ($case.Name + ': unexpected validator result: ' + $output)
        }
        if ($case.Links -and $report.Passed -ne ($case.Broken -eq 0)) {
            throw ($case.Name + ': incorrect pass/fail result')
        }
        Write-Output ('PASS ' + $case.Name)
    }
    Write-Output ('Passed ' + $cases.Count + ' validator compatibility checks.')
}
finally {
    $resolvedFixture = [IO.Path]::GetFullPath($fixtureRoot)
    $expectedPrefix = $tempBase.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedFixture.StartsWith($expectedPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Refusing cleanup outside the temporary directory.'
    }
    if (Test-Path -LiteralPath $resolvedFixture) {
        Remove-Item -LiteralPath $resolvedFixture -Recurse -Force
    }
}
