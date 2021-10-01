# In *Windows PowerShell*, prepend `$OutputEncoding = `
# $OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

Invoke-Expression Clear-Host
Invoke-Expression (&starship init powershell)
