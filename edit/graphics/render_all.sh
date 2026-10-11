#!/bin/bash
cd /home/user/leo/edit/graphics
for g in g*/; do g=${g%/}
  ( cd $g && rm -rf snapshots && hyperframes render . --fps 240 --crf 12 -o ../out/${g}_240.mp4 > ../out/${g}_render.log 2>&1; echo "$g $(ffprobe -v error -show_entries stream=nb_frames -of csv=p=0 ../out/${g}_240.mp4)" ) &
  while [ $(jobs -r | wc -l) -ge 2 ]; do sleep 2; done
done; wait; echo ALLDONE
