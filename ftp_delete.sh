ftp -n <<EOF
open <HOST>
user <USER> <PASS>

delete $1
EOF
