#!/bin/bash
cd /home/user/leo/edit/graphics
for g in g*/; do g=${g%/}; d=$(grep -o 'data-duration="[0-9.]*"' $g/index.html | head -1 | grep -o '[0-9.]*')
  ts=$(python3 -c "d=$d; print(','.join('%.3f'%x for x in (0, d*0.33, d*0.66, d-0.02)))")
  (cd $g && rm -rf snapshots && timeout 300 hyperframes snapshot . --at $ts > /dev/null 2>&1) &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 1; done
done; wait; echo done
