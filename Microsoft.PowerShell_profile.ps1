# Chocolatey profile
# $ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
# if (Test-Path($ChocolateyProfile)) {
#   Import-Module "$ChocolateyProfile"
# }

# Does the the rough equivalent of dir /s /b. For example, dirs *.png is dir /s /b *.png
function dirs {
  if ($args.Count -gt 0) {
    Get-ChildItem -Recurse -Include "$args" | Foreach-Object FullName
  }
  else {
    Get-ChildItem -Recurse | Foreach-Object FullName
  }
}

function g { cd C:\Users\lukes\Github }

function get-ip {
  (Invoke-WebRequest http://ifconfig.me/ip ).Content
}

function uptime {
  Get-WmiObject win32_operatingsystem | select csname, @{LABEL='LastBootUpTime';
  EXPRESSION={$_.ConverttoDateTime($_.lastbootuptime)}}
}

function reload-profile {
  & $profile
}

function find-file($name) {
  ls -recurse -filter "*${name}*" -ErrorAction SilentlyContinue | foreach {
    $place_path = $_.directory
    echo "${place_path}\${_}"
  }
}

function grep($regex, $dir) {
  if ( $dir ) {
    ls $dir | select-string $regex
    return
  }
  $input | select-string $regex
}

function touch($file) {
  "" | Out-File $file -Encoding ASCII
}

function sed($file, $find, $replace){
  (Get-Content $file).replace("$find", $replace) | Set-Content $file
}
function which($name) {
  Get-Command $name | Select-Object -ExpandProperty Definition
}
function export($name, $value) {
  set-item -force -path "env:$name" -value $value;
}
function pkill($name) {
  ps $name -ErrorAction SilentlyContinue | kill
}
function pgrep($name) {
  ps $name
}

# Alias PNPM to pn
Set-Alias -Name pn -Value pnpm

Invoke-Expression Clear-Host
Invoke-Expression (&starship init powershell)
