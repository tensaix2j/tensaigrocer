


curl -X PUT http://localhost:3000/api/payment/crypto \
  -H "Content-Type: application/json" \
  -d "{\"orderNo\":\"crypto-6a0873ca8ce9936a96e20f84-${1}\",\"status\":\"confirmed\", \"txHash\":\"0x123456\"}"



