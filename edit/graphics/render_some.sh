#!/bin/bash
# re-render selected compositions (2 in parallel): ./render_some.sh g01 g09 ...
cd /home/user/leo/edit/graphics
for g in "$@"; do
  ( cd $g && rm -rf snapshots && hyperframes render . --fps 240 --crf 12 -o ../out/${g}_240.mp4 > ../out/${g}_render.log 2>&1; echo "$g $(ffprobe -v error -show_entries stream=nb_frames -of csv=p=0 ../out/${g}_240.mp4)" ) &
  while [ $(jobs -r | wc -l) -ge 2 ]; do sleep 2; done
done; wait; echo SOMEDONE
