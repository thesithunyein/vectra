@echo off
set FFMPEG=C:\Users\sithu\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe
set OUT=C:\Users\sithu\Projects\vectra-app\public

"%FFMPEG%" -y -f lavfi -i color=c=0x0a1628:s=1280x720:d=10:r=24 -vf "hue=s=0.35:h='30+20*sin(2*PI*t/10)',eq=brightness=-0.08:contrast=1.15,boxblur=2:1,format=yuv420p" -t 10 -an -c:v libx264 -pix_fmt yuv420p -crf 24 -movflags +faststart "%OUT%\hero-montage.mp4"
"%FFMPEG%" -y -i "%OUT%\hero-montage.mp4" -c:v libvpx-vp9 -b:v 600k "%OUT%\hero-montage.webm"
"%FFMPEG%" -y -i "%OUT%\hero-montage.mp4" -frames:v 1 -q:v 2 "%OUT%\hero-montage-poster.jpg"
