@echo off
rem Doppelklick-Start: ruft START.ps1 auf (umgeht die PowerShell-Sperre für Skripte nur für diesen Aufruf)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0START.ps1"
