# Script de Compilación de Tesis UMSA con Pandoc y Citas Bibliográficas APA 7ma Edición
# Uso en PowerShell: .\compilar.ps1 [archivo_origen.md]

param (
    [string]$ArchivoOrigen = "02_borrador_refinado.md",
    [string]$ArchivoSalida = "tesis_compilada.docx",
    [string]$ReferenciaDoc = "tesis_borrador.docx",
    [string]$BibFile = "referencias.bib",
    [string]$CslFile = "apa.csl"
)

$ErrorActionPreference = "Stop"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      PLATAFORMA MEH - COMPILADOR ACADÉMICO PANDOC        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verificar si Pandoc está instalado (probando comando directo y rutas comunes)
$PandocCmd = "pandoc"
try {
    $null = & pandoc --version
    Write-Host "[OK] Pandoc está en el PATH del sistema." -ForegroundColor Green
} catch {
    # Probar rutas comunes de instalación en Windows
    $username = [System.Environment]::UserName
    $rutasComunes = @(
        "C:\Users\$username\AppData\Local\Pandoc\pandoc.exe",
        "C:\Program Files\Pandoc\pandoc.exe",
        "C:\Program Files (x86)\Pandoc\pandoc.exe"
    )
    
    $encontrado = $false
    foreach ($ruta in $rutasComunes) {
        if (Test-Path $ruta) {
            $PandocCmd = $ruta
            $encontrado = $true
            Write-Host "[OK] Pandoc detectado en: $ruta" -ForegroundColor Green
            break
        }
    }
    
    if (!$encontrado) {
        Write-Host "[ERROR] Pandoc no está instalado o no se encuentra en las rutas comunes." -ForegroundColor Red
        Write-Host "Por favor, instala Pandoc (https://pandoc.org/installing.html) o agrégalo al PATH e intenta de nuevo." -ForegroundColor Yellow
        Exit 1
    }
}

# 2. Verificar archivo de origen
if (!(Test-Path $ArchivoOrigen)) {
    if ($ArchivoOrigen -eq "02_borrador_refinado.md" -and (Test-Path "01_borrador_original.md")) {
        Write-Host "[INFO] El archivo '$ArchivoOrigen' no existe aún. Compilando con el borrador original '01_borrador_original.md'." -ForegroundColor Yellow
        $ArchivoOrigen = "01_borrador_original.md"
    } else {
        Write-Host "[ERROR] No se encuentra el archivo de origen: $ArchivoOrigen" -ForegroundColor Red
        Exit 1
    }
}

# 3. Verificar archivo de referencia (plantilla Word)
if (!(Test-Path $ReferenciaDoc)) {
    Write-Host "[ERROR] No se encuentra el borrador de estilos base '$ReferenciaDoc' en el directorio." -ForegroundColor Red
    Write-Host "Este archivo es obligatorio para aplicar los márgenes, fuentes y formatos APA heredados." -ForegroundColor Yellow
    Exit 1
}

# 4. Verificar base de datos de referencias (.bib)
if (!(Test-Path $BibFile)) {
    Write-Host "[WARNING] No se encuentra el archivo de base de datos bibliográfica '$BibFile'." -ForegroundColor Yellow
    Write-Host "Las citas automáticas no se generarán." -ForegroundColor Yellow
}

# 5. Descargar o verificar el archivo de estilo CSL (APA 7ma Edición)
if (!(Test-Path $CslFile)) {
    Write-Host "[INFO] Descargando el estilo de citación oficial APA 7ma Edición (apa.csl)..." -ForegroundColor Cyan
    try {
        $cslUrl = "https://raw.githubusercontent.com/citation-style-language/styles/master/apa.csl"
        Invoke-WebRequest -Uri $cslUrl -OutFile $CslFile -UseBasicParsing
        Write-Host "[OK] Estilo apa.csl descargado con éxito." -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] No se pudo descargar el archivo apa.csl. Se usará el formato de citas por defecto de Pandoc." -ForegroundColor Yellow
        $CslFile = $null
    }
} else {
    Write-Host "[OK] Estilo apa.csl encontrado localmente." -ForegroundColor Green
}

# 6. Ejecutar compilación con Pandoc
Write-Host "[INFO] Compilando '$ArchivoOrigen' a '$ArchivoSalida'..." -ForegroundColor Cyan
Write-Host "   - Usando plantilla de diseño: $ReferenciaDoc" -ForegroundColor Gray
if ($BibFile -and (Test-Path $BibFile)) {
    Write-Host "   - Procesando citas con base de datos: $BibFile" -ForegroundColor Gray
}
if ($CslFile -and (Test-Path $CslFile)) {
    Write-Host "   - Aplicando reglas de estilo: $CslFile" -ForegroundColor Gray
}

try {
    $arguments = @()
    $arguments += $ArchivoOrigen
    $arguments += "-o"
    $arguments += $ArchivoSalida
    $arguments += "--reference-doc=$ReferenciaDoc"
    
    if ($BibFile -and (Test-Path $BibFile)) {
        $arguments += "--citeproc"
        $arguments += "--bibliography=$BibFile"
        if ($CslFile -and (Test-Path $CslFile)) {
            $arguments += "--csl=$CslFile"
        }
    }
    
    # Ejecutar Pandoc con los argumentos estructurados
    & $PandocCmd $arguments
    
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "[COMPLETADO] Tesis compilada con éxito absoluto en:" -ForegroundColor Green
    Write-Host " >> $(Resolve-Path $ArchivoSalida)" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Ocurrió un error crítico durante la compilación con Pandoc:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Exit 1
}
