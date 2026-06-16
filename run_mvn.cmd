@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-16.0.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"
"%~dp0maven\bin\mvn.cmd" %*
