$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Tsukuyomi Watch server running at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop."

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {

    
    $context = $listener.GetContext()
    $path = $context.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }

    $filePath = Join-Path $root $path.Replace("/", "\")

    $context.Response.AddHeader("Access-Control-Allow-Origin", "*")
    $context.Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentType = $mime
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.StatusCode = 200
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    else {
        $context.Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $context.Response.Close()
}
