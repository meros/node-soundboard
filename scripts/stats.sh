if [ -e $1.stats ]
then
    wc -l $1.stats | cut -f1 -d" "
else
    echo 0
fi
