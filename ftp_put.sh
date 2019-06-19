ftp -n <<EOF
open <HOST>
user <USER> <PASS>

put $1 $1
EOF
